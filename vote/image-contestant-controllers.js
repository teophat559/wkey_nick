// controllers/imageController.js
const Image = require('../models/Image');
const ActivityLog = require('../models/ActivityLog');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');

class ImageController {
  // Get all images with filters
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        category,
        search,
        folder
      } = req.query;

      // Build filter
      const filter = {};
      if (category) filter.category = category;
      if (folder) filter.folder = folder;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const total = await Image.countDocuments(filter);

      // Get images
      const images = await Image.find(filter)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        images,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get images error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get single image
  async getById(req, res) {
    try {
      const image = await Image.findById(req.params.id)
        .populate('uploadedBy', 'name email');

      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }

      res.json({ image });
    } catch (error) {
      console.error('Get image error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Upload single image
  async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { category, folder = 'uploads', tags, description } = req.body;

      // Process image with Sharp
      const processedPath = await this.processImage(req.file.path, category);
      
      // Get image dimensions
      const metadata = await sharp(processedPath).metadata();

      // Create image record
      const image = new Image({
        name: req.file.filename,
        originalName: req.file.originalname,
        url: `/uploads/images/${req.file.filename}`,
        category: category || 'general',
        size: req.file.size,
        format: metadata.format,
        dimensions: {
          width: metadata.width,
          height: metadata.height
        },
        folder,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        description,
        uploadedBy: req.user._id
      });

      await image.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Upload Image',
        entity: 'Image',
        entityId: image._id,
        details: `Uploaded image: ${image.originalName}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await image.populate('uploadedBy', 'name email');

      res.status(201).json({
        message: 'Image uploaded successfully',
        image
      });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Upload multiple images
  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const { category, folder = 'uploads', tags, description } = req.body;
      const uploadedImages = [];

      for (const file of req.files) {
        try {
          // Process image
          const processedPath = await this.processImage(file.path, category);
          const metadata = await sharp(processedPath).metadata();

          // Create image record
          const image = new Image({
            name: file.filename,
            originalName: file.originalname,
            url: `/uploads/images/${file.filename}`,
            category: category || 'general',
            size: file.size,
            format: metadata.format,
            dimensions: {
              width: metadata.width,
              height: metadata.height
            },
            folder,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            description,
            uploadedBy: req.user._id
          });

          await image.save();
          uploadedImages.push(image);
        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
        }
      }

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Upload Multiple Images',
        entity: 'Image',
        details: `Uploaded ${uploadedImages.length} images`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        message: `${uploadedImages.length} images uploaded successfully`,
        images: uploadedImages
      });
    } catch (error) {
      console.error('Upload multiple images error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Process image (resize, optimize)
  async processImage(imagePath, category) {
    try {
      let targetWidth, targetHeight;

      // Set dimensions based on category
      switch (category) {
        case 'avatar':
          targetWidth = 300;
          targetHeight = 300;
          break;
        case 'banner':
          targetWidth = 1200;
          targetHeight = 400;
          break;
        case 'contestant':
          targetWidth = 800;
          targetHeight = 1000;
          break;
        default:
          targetWidth = 1024;
          targetHeight = 768;
      }

      const outputPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_processed.$1');

      await sharp(imagePath)
        .resize(targetWidth, targetHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 90 })
        .png({ quality: 90 })
        .toFile(outputPath);

      // Replace original with processed
      fs.unlinkSync(imagePath);
      fs.renameSync(outputPath, imagePath);

      return imagePath;
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }

  // Update image metadata
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const image = await Image.findById(req.params.id);
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }

      const { category, tags, description, folder } = req.body;

      // Update fields
      if (category) image.category = category;
      if (tags) image.tags = tags.split(',').map(tag => tag.trim());
      if (description !== undefined) image.description = description;
      if (folder) image.folder = folder;

      await image.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Update Image',
        entity: 'Image',
        entityId: image._id,
        details: `Updated image metadata: ${image.name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await image.populate('uploadedBy', 'name email');

      res.json({
        message: 'Image updated successfully',
        image
      });
    } catch (error) {
      console.error('Update image error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Delete image
  async delete(req, res) {
    try {
      const image = await Image.findById(req.params.id);
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }

      // Delete physical file
      const filePath = path.join(__dirname, '..', 'uploads', 'images', image.name);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete database record
      await Image.findByIdAndDelete(req.params.id);

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Delete Image',
        entity: 'Image',
        entityId: image._id,
        details: `Deleted image: ${image.name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Bulk delete images
  async bulkDelete(req, res) {
    try {
      const { imageIds } = req.body;

      if (!imageIds || !Array.isArray(imageIds)) {
        return res.status(400).json({ message: 'Image IDs array required' });
      }

      const images = await Image.find({ _id: { $in: imageIds } });

      // Delete physical files
      for (const image of images) {
        const filePath = path.join(__dirname, '..', 'uploads', 'images', image.name);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Delete database records
      const result = await Image.deleteMany({ _id: { $in: imageIds } });

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Bulk Delete Images',
        entity: 'Image',
        details: `Deleted ${result.deletedCount} images`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: `Deleted ${result.deletedCount} images`,
        deleted: result.deletedCount
      });
    } catch (error) {
      console.error('Bulk delete images error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Create folder (organize images)
  async createFolder(req, res) {
    try {
      const { name, parent = 'uploads' } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Folder name required' });
      }

      const folderPath = path.join(__dirname, '..', 'uploads', 'images', parent, name);

      // Create physical folder
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Create Image Folder',
        entity: 'Image',
        details: `Created folder: ${parent}/${name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: 'Folder created successfully',
        folder: `${parent}/${name}`
      });
    } catch (error) {
      console.error('Create folder error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Move images to folder
  async moveToFolder(req, res) {
    try {
      const { imageIds, targetFolder } = req.body;

      if (!imageIds || !Array.isArray(imageIds)) {
        return res.status(400).json({ message: 'Image IDs array required' });
      }

      const result = await Image.updateMany(
        { _id: { $in: imageIds } },
        { folder: targetFolder }
      );

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Move Images to Folder',
        entity: 'Image',
        details: `Moved ${result.matchedCount} images to ${targetFolder}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: `Moved ${result.matchedCount} images`,
        moved: result.matchedCount
      });
    } catch (error) {
      console.error('Move images error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get image statistics
  async getStatistics(req, res) {
    try {
      const stats = await Image.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' }
          }
        },
        {
          $group: {
            _id: null,
            totalImages: { $sum: '$count' },
            totalSize: { $sum: '$totalSize' },
            categories: {
              $push: {
                category: '$_id',
                count: '$count',
                size: '$totalSize'
              }
            }
          }
        }
      ]);

      const result = stats[0] || {
        totalImages: 0,
        totalSize: 0,
        categories: []
      };

      res.json({ statistics: result });
    } catch (error) {
      console.error('Get image statistics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new ImageController();

// controllers/contestantController.js
const Contestant = require('../models/Contestant');
const Contest = require('../models/Contest');
const ActivityLog = require('../models/ActivityLog');
const ExcelJS = require('exceljs');
const { validationResult } = require('express-validator');

class ContestantController {
  // Get all contestants with filters
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        contest,
        status,
        search
      } = req.query;

      // Build filter
      const filter = {};
      if (contest) filter.contest = contest;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { number: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const total = await Contestant.countDocuments(filter);

      // Get contestants
      const contestants = await Contestant.find(filter)
        .populate('contest', 'name')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        contestants,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get contestants error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get single contestant
  async getById(req, res) {
    try {
      const contestant = await Contestant.findById(req.params.id)
        .populate('contest', 'name description')
        .populate('createdBy', 'name email');

      if (!contestant) {
        return res.status(404).json({ message: 'Contestant not found' });
      }

      res.json({ contestant });
    } catch (error) {
      console.error('Get contestant error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Create new contestant
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if contest exists
      const contest = await Contest.findById(req.body.contest);
      if (!contest) {
        return res.status(400).json({ message: 'Contest not found' });
      }

      // Check if number already exists
      const existingContestant = await Contestant.findOne({ 
        number: req.body.number,
        contest: req.body.contest 
      });
      if (existingContestant) {
        return res.status(400).json({ message: 'Contestant number already exists in this contest' });
      }

      const contestantData = {
        ...req.body,
        createdBy: req.user._id
      };

      const contestant = new Contestant(contestantData);
      await contestant.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Create Contestant',
        entity: 'Contestant',
        entityId: contestant._id,
        details: `Created contestant: ${contestant.name} (${contestant.number})`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await contestant.populate(['contest', 'createdBy']);

      res.status(201).json({
        message: 'Contestant created successfully',
        contestant
      });
    } catch (error) {
      console.error('Create contestant error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Update contestant
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const contestant = await Contestant.findById(req.params.id);
      if (!contestant) {
        return res.status(404).json({ message: 'Contestant not found' });
      }

      // Store old values for activity log
      const oldValues = contestant.toObject();

      // Update contestant
      Object.assign(contestant, req.body);
      await contestant.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Update Contestant',
        entity: 'Contestant',
        entityId: contestant._id,
        details: `Updated contestant: ${contestant.name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        changes: {
          old: oldValues,
          new: contestant.toObject()
        }
      });

      await contestant.populate(['contest', 'createdBy']);

      res.json({
        message: 'Contestant updated successfully',
        contestant
      });
    } catch (error) {
      console.error('Update contestant error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Delete contestant
  async delete(req, res) {
    try {
      const contestant = await Contestant.findById(req.params.id);
      if (!contestant) {
        return res.status(404).json({ message: 'Contestant not found' });
      }

      await Contestant.findByIdAndDelete(req.params.id);

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Delete Contestant',
        entity: 'Contestant',
        entityId: contestant._id,
        details: `Deleted contestant: ${contestant.name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Contestant deleted successfully' });
    } catch (error) {
      console.error('Delete contestant error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Import contestants from Excel
  async importFromExcel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Excel file required' });
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      
      const worksheet = workbook.getWorksheet(1);
      const contestants = [];
      const errors = [];

      // Skip header row (row 1)
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        
        if (!row.getCell(1).value) continue; // Skip empty rows

        try {
          const contestantData = {
            name: row.getCell(1).value,
            number: row.getCell(2).value,
            contest: req.body.contestId,
            email: row.getCell(3).value,
            phone: row.getCell(4).value,
            description: row.getCell(5).value || '',
            createdBy: req.user._id
          };

          // Validate required fields
          if (!contestantData.name || !contestantData.number || !contestantData.email) {
            errors.push(`Row ${rowNumber}: Missing required fields`);
            continue;
          }

          // Check if number already exists
          const existing = await Contestant.findOne({ 
            number: contestantData.number,
            contest: contestantData.contest 
          });
          
          if (existing) {
            errors.push(`Row ${rowNumber}: Number ${contestantData.number} already exists`);
            continue;
          }

          const contestant = new Contestant(contestantData);
          await contestant.save();
          contestants.push(contestant);
        } catch (error) {
          errors.push(`Row ${rowNumber}: ${error.message}`);
        }
      }

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Import Contestants',
        entity: 'Contestant',
        details: `Imported ${contestants.length} contestants, ${errors.length} errors`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: `Import completed: ${contestants.length} contestants imported`,
        imported: contestants.length,
        errors
      });
    } catch (error) {
      console.error('Import contestants error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Export contestants to Excel
  async exportToExcel(req, res) {
    try {
      const { contest, status } = req.query;

      // Build filter
      const filter = {};
      if (contest) filter.contest = contest;
      if (status) filter.status = status;

      // Get contestants
      const contestants = await Contestant.find(filter)
        .populate('contest', 'name')
        .sort({ number: 1 });

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Contestants');

      // Add headers
      worksheet.columns = [
        { header: 'Số báo danh', key: 'number', width: 15 },
        { header: 'Họ tên', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Điện thoại', key: 'phone', width: 15 },
        { header: 'Cuộc thi', key: 'contest', width: 30 },
        { header: 'Trạng thái', key: 'status', width: 15 },
        { header: 'Mô tả', key: 'description', width: 40 },
        { header: 'Ngày tạo', key: 'createdAt', width: 20 }
      ];

      // Add data
      contestants.forEach(contestant => {
        worksheet.addRow({
          number: contestant.number,
          name: contestant.name,
          email: contestant.email,
          phone: contestant.phone,
          contest: contestant.contest.name,
          status: contestant.status,
          description: contestant.description,
          createdAt: contestant.createdAt.toLocaleDateString('vi-VN')
        });
      });

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Export Contestants',
        entity: 'Contestant',
        details: `Exported ${contestants.length} contestants`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Send file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=contestants-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (error) {
      console.error('Export contestants error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get template Excel for import
  async getImportTemplate(req, res) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Template');

      // Add headers
      worksheet.columns = [
        { header: 'Họ tên *', key: 'name', width: 25 },
        { header: 'Số báo danh *', key: 'number', width: 15 },
        { header: 'Email *', key: 'email', width: 30 },
        { header: 'Điện thoại', key: 'phone', width: 15 },
        { header: 'Mô tả', key: 'description', width: 40 }
      ];

      // Add sample data
      worksheet.addRow({
        name: 'Nguyễn Văn A',
        number: 'SBD001',
        email: 'nguyenvana@email.com',
        phone: '0901234567',
        description: 'Mô tả về thí sinh'
      });

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add instructions
      worksheet.addRow([]);
      worksheet.addRow(['HƯỚNG DẪN:']);
      worksheet.addRow(['- Các cột có dấu (*) là bắt buộc']);
      worksheet.addRow(['- Số báo danh phải duy nhất trong cuộc thi']);
      worksheet.addRow(['- Email phải đúng định dạng']);
      worksheet.addRow(['- Điện thoại nên có đầu số 09, 08, 07, 03, 05']);

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Send file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=contestant-template.xlsx');
      res.send(buffer);
    } catch (error) {
      console.error('Get import template error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get statistics
  async getStatistics(req, res) {
    try {
      const { contest } = req.query;
      const filter = contest ? { contest } : {};

      const stats = await Contestant.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        total: 0,
        active: 0,
        pending: 0,
        rejected: 0,
        disqualified: 0
      };

      stats.forEach(stat => {
        result.total += stat.count;
        result[stat._id] = stat.count;
      });

      res.json({ statistics: result });
    } catch (error) {
      console.error('Get contestant statistics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new ContestantController();