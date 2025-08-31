// Before & After Pro - Main Application
// Optimized for performance and maintainability with Supabase backend

import { authService } from './supabase-client.js';
import { presetService } from './preset-service.js';
import { stripeService } from './stripe-service.js';
import { authUI } from './auth-ui.js';

class BeforeAfterApp {
    constructor() {
        this.state = {
            beforeImage: null,
            afterImage: null,
            logoImage: null,
            clinicName: '',
            treatmentName: '',
            patientName: '',
            treatmentDate: '',
            aspectRatio: 'square',
            font: 'Inter',
            beforeImageY: 0.5,
            afterImageY: 0.5,
            beforeImageX: 0.5,
            afterImageX: 0.5,
            beforeImageZoom: 1,
            afterImageZoom: 1,
            brandColor: '#000000',
            textColor: '#1e293b',
            differences: '',
            differencesBoxColor: '#000000',
        };

        this.isProUser = false;
        this.exportCount = 0;
        this.debounceTimer = null;
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupPlanFeatures();
        this.loadLastUsed();
        this.refreshPresetSelect();
        this.setupDragAndDrop();
        this.setupAutoSave();
        
        // Initialize authentication UI
        authUI.init();
    }

    cacheElements() {
        // DOM Elements
        this.elements = {
            beforeUpload: document.getElementById('before-upload'),
            afterUpload: document.getElementById('after-upload'),
            logoUpload: document.getElementById('logo-upload'),
            clinicNameInput: document.getElementById('clinic-name'),
            treatmentNameInput: document.getElementById('treatment-name'),
            patientNameInput: document.getElementById('patient-name'),
            treatmentDateInput: document.getElementById('treatment-date'),
            brandColorText: document.getElementById('brand-color-text'),
            brandColorPicker: document.getElementById('brand-color-picker'),
            brandColorPreview: document.getElementById('brand-color-preview'),
            textColorText: document.getElementById('text-color-text'),
            textColorPicker: document.getElementById('text-color-picker'),
            textColorPreview: document.getElementById('text-color-preview'),
            boxColorText: document.getElementById('box-color-text'),
            boxColorPicker: document.getElementById('box-color-picker'),
            boxColorPreview: document.getElementById('box-color-preview'),
            differencesText: document.getElementById('differences-text'),
            exportBtn: document.getElementById('export-btn'),
            canvas: document.getElementById('canvas'),
            previewPlaceholder: document.getElementById('preview-placeholder'),
            formatSelector: document.getElementById('format-selector'),
            fontSelector: document.getElementById('font-selector'),
            canvasContainer: document.getElementById('canvas-container'),
            beforeSliderContainer: document.getElementById('before-slider-container'),
            afterSliderContainer: document.getElementById('after-slider-container'),
            beforeYSlider: document.getElementById('before-y-slider'),
            afterYSlider: document.getElementById('after-y-slider'),
            beforeXSlider: document.getElementById('before-x-slider'),
            afterXSlider: document.getElementById('after-x-slider'),
            beforeZoomSlider: document.getElementById('before-zoom-slider'),
            afterZoomSlider: document.getElementById('after-zoom-slider'),
            resetBtn: document.getElementById('reset-btn'),
            presetNameInput: document.getElementById('preset-name'),
            presetSaveBtn: document.getElementById('preset-save'),
            presetSelect: document.getElementById('preset-select'),
            presetDeleteBtn: document.getElementById('preset-delete'),
            presetExportBtn: document.getElementById('preset-export'),
            presetImportInput: document.getElementById('preset-import'),
            planPill: document.getElementById('plan-pill'),
            upgradeBtn: document.getElementById('upgrade-btn'),
            beforePreview: document.getElementById('before-preview'),
            afterPreview: document.getElementById('after-preview'),
            logoPreview: document.getElementById('logo-preview')
        };

        // Canvas context
        this.ctx = this.elements.canvas.getContext('2d');
        
        // Initial setup
        this.elements.exportBtn.disabled = true;
    }

    bindEvents() {
        // Reset button
        this.elements.resetBtn.addEventListener('click', () => this.resetApp());
        
        // Color picker interactions
        this.elements.brandColorPreview.addEventListener('click', () => this.elements.brandColorPicker.click());
        this.elements.textColorPreview.addEventListener('click', () => this.elements.textColorPicker.click());
        this.elements.boxColorPreview.addEventListener('click', () => this.elements.boxColorPicker.click());

        // Color picker inputs
        this.elements.brandColorPicker.addEventListener('input', (e) => this.handleColorChange('brandColor', e.target.value));
        this.elements.textColorPicker.addEventListener('input', (e) => this.handleColorChange('textColor', e.target.value));
        this.elements.boxColorPicker.addEventListener('input', (e) => this.handleColorChange('differencesBoxColor', e.target.value));

        // Color text inputs
        this.elements.brandColorText.addEventListener('input', (e) => this.handleColorTextInput('brandColor', e.target.value));
        this.elements.textColorText.addEventListener('input', (e) => this.handleColorTextInput('textColor', e.target.value));
        this.elements.boxColorText.addEventListener('input', (e) => this.handleColorTextInput('differencesBoxColor', e.target.value));

        // Other inputs
        this.elements.differencesText.addEventListener('input', (e) => {
            this.state.differences = e.target.value;
            this.debouncedUpdateCanvas();
        });

        // Sliders
        this.elements.beforeYSlider.addEventListener('input', (e) => { this.state.beforeImageY = parseFloat(e.target.value); this.debouncedUpdateCanvas(); });
        this.elements.afterYSlider.addEventListener('input', (e) => { this.state.afterImageY = parseFloat(e.target.value); this.debouncedUpdateCanvas(); });
        this.elements.beforeXSlider.addEventListener('input', (e) => { this.state.beforeImageX = parseFloat(e.target.value); this.debouncedUpdateCanvas(); });
        this.elements.afterXSlider.addEventListener('input', (e) => { this.state.afterImageX = parseFloat(e.target.value); this.debouncedUpdateCanvas(); });
        this.elements.beforeZoomSlider.addEventListener('input', (e) => { this.state.beforeImageZoom = parseFloat(e.target.value); this.debouncedUpdateCanvas(); });
        this.elements.afterZoomSlider.addEventListener('input', (e) => { this.state.afterImageZoom = parseFloat(e.target.value); this.debouncedUpdateCanvas(); });

        // Selectors
        this.elements.fontSelector.addEventListener('change', (e) => { this.state.font = e.target.value; this.debouncedUpdateCanvas(); });
        this.elements.formatSelector.addEventListener('change', (e) => this.handleFormatChange(e.target.value));

        // File uploads
        this.elements.beforeUpload.addEventListener('change', (e) => this.handleImageUpload(e, 'beforeImage', this.elements.beforePreview, this.elements.beforeSliderContainer, this.elements.beforeYSlider, this.elements.beforeXSlider, this.elements.beforeZoomSlider));
        this.elements.afterUpload.addEventListener('change', (e) => this.handleImageUpload(e, 'afterImage', this.elements.afterPreview, this.elements.afterSliderContainer, this.elements.afterYSlider, this.elements.afterXSlider, this.elements.afterZoomSlider));
        this.elements.logoUpload.addEventListener('change', (e) => this.handleImageUpload(e, 'logoImage', this.elements.logoPreview));

        // Text inputs
        this.elements.clinicNameInput.addEventListener('input', (e) => { this.state.clinicName = e.target.value; this.debouncedUpdateCanvas(); });
        this.elements.treatmentNameInput.addEventListener('input', (e) => { this.state.treatmentName = e.target.value; this.debouncedUpdateCanvas(); });
        this.elements.patientNameInput.addEventListener('input', (e) => { this.state.patientName = e.target.value; });
        this.elements.treatmentDateInput.addEventListener('input', (e) => { this.state.treatmentDate = e.target.value; });

        // Export button
        this.elements.exportBtn.addEventListener('click', () => this.handleExport());

        // Preset events
        this.elements.presetSaveBtn.addEventListener('click', () => this.savePreset());
        this.elements.presetSelect.addEventListener('change', (e) => this.loadPreset(e.target.value));
        this.elements.presetDeleteBtn.addEventListener('click', () => this.deletePreset());
        this.elements.presetExportBtn.addEventListener('click', () => this.exportPreset());
        this.elements.presetImportInput.addEventListener('change', (e) => this.importPreset(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    handleColorChange(colorType, value) {
        this.state[colorType] = value;
        this.elements[`${colorType}Text`].value = value;
        this.elements[`${colorType}Preview`].style.backgroundColor = value;
        this.debouncedUpdateCanvas();
    }

    handleColorTextInput(colorType, value) {
        if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
            this.state[colorType] = value;
            this.elements[`${colorType}Picker`].value = value;
            this.elements[`${colorType}Preview`].style.backgroundColor = value;
            this.debouncedUpdateCanvas();
        }
    }

    handleFormatChange(aspectRatio) {
        this.state.aspectRatio = aspectRatio;
        this.elements.canvasContainer.className = 'w-full max-w-md bg-slate-100 rounded-lg flex items-center justify-center';
        
        switch(aspectRatio) {
            case 'portrait':
                this.elements.canvasContainer.classList.add('aspect-[1080/1350]');
                break;
            case 'landscape':
                this.elements.canvasContainer.classList.add('aspect-[1080/566]');
                break;
            default:
                this.elements.canvasContainer.classList.add('aspect-square');
                break;
        }
        
        this.debouncedUpdateCanvas();
    }

    handleImageUpload(e, targetImage, previewElement, sliderContainer, sliderY, sliderX, sliderZoom) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('Image file is too large. Please select an image under 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                this.state[targetImage] = img;
                
                if (sliderContainer) {
                    sliderY.value = 0.5;
                    sliderX.value = 0.5;
                    sliderZoom.value = 1;
                    this.state[targetImage.replace('Image', 'ImageY')] = 0.5;
                    this.state[targetImage.replace('Image', 'ImageX')] = 0.5;
                    this.state[targetImage.replace('Image', 'ImageZoom')] = 1;
                    sliderContainer.classList.remove('hidden');
                    sliderY.disabled = false;
                    sliderX.disabled = false;
                    sliderZoom.disabled = false;
                }
                
                previewElement.src = event.target.result;
                previewElement.classList.remove('hidden');
                this.debouncedUpdateCanvas();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    drawImageCover(ctx, img, x, y, w, h, offsetX = 0.5, offsetY = 0.5, zoom = 1) {
        const imgRatio = img.width / img.height;
        const containerRatio = w / h;
        
        let sWidth = img.width / zoom;
        let sHeight = img.height / zoom;
        let sx = (img.width - sWidth) * offsetX;
        let sy = (img.height - sHeight) * offsetY;

        if (sWidth / sHeight > containerRatio) {
            sHeight = sWidth / containerRatio;
            sy = (img.height - sHeight) * offsetY;
        } else {
            sWidth = sHeight * containerRatio;
            sx = (img.width - sWidth) * offsetX;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
    }

    updateCanvas() {
        if (!this.state.beforeImage || !this.state.afterImage) {
            this.elements.exportBtn.disabled = true;
            return;
        }

        this.elements.previewPlaceholder.classList.add('hidden');
        this.elements.exportBtn.disabled = false;

        const PADDING = 40;
        const HEADER_HEIGHT = 180;
        const HEADER_BG = '#FFFFFF';
        const HEADER_BORDER = '#e2e8f0';
        const LABEL_COLOR = '#FFFFFF';
        
        let CANVAS_WIDTH = 1080;
        let CANVAS_HEIGHT = 1080;
        
        switch(this.state.aspectRatio) {
            case 'portrait': CANVAS_HEIGHT = 1350; break;
            case 'landscape': CANVAS_HEIGHT = 566; break;
        }

        this.elements.canvas.width = CANVAS_WIDTH;
        this.elements.canvas.height = CANVAS_HEIGHT;
        
        // Clear and fill background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw header
        this.ctx.fillStyle = HEADER_BG;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, HEADER_HEIGHT);
        this.ctx.fillStyle = HEADER_BORDER;
        this.ctx.fillRect(0, HEADER_HEIGHT - 2, CANVAS_WIDTH, 2);
        
        // Set text properties
        this.ctx.fillStyle = this.state.textColor;
        this.ctx.textBaseline = 'middle';
        
        // Draw clinic name and logo
        const clinicNameFont = `500 36px '${this.state.font}', sans-serif`;
        this.ctx.font = clinicNameFont;
        const clinicNameMetrics = this.ctx.measureText(this.state.clinicName);
        const clinicNameWidth = this.state.clinicName ? clinicNameMetrics.width : 0;
        
        let logoWidth = 0;
        let logoHeight = 0;
        let logoGap = 0;
        
        if (this.state.logoImage) {
            logoHeight = 60;
            const logoAspectRatio = this.state.logoImage.width / this.state.logoImage.height;
            logoWidth = logoHeight * logoAspectRatio;
            logoGap = this.state.clinicName ? 15 : 0;
        }

        const totalTopLineWidth = logoWidth + logoGap + clinicNameWidth;
        let currentX = (CANVAS_WIDTH - totalTopLineWidth) / 2;
        const topY = HEADER_HEIGHT * 0.45;

        if (this.state.logoImage) {
            this.ctx.drawImage(this.state.logoImage, currentX, topY - logoHeight / 2, logoWidth, logoHeight);
            currentX += logoWidth + logoGap;
        }

        if (this.state.clinicName) {
            this.ctx.textAlign = 'left';
            this.ctx.fillText(this.state.clinicName, currentX, topY);
        }

        // Draw treatment name
        const treatmentFont = `400 30px '${this.state.font}', sans-serif`;
        this.ctx.font = treatmentFont;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.state.treatmentName, CANVAS_WIDTH / 2, HEADER_HEIGHT * 0.78);
        
        // Draw images
        const imageAreaY = HEADER_HEIGHT;
        const imageAreaHeight = CANVAS_HEIGHT - HEADER_HEIGHT;
        
        if (this.state.aspectRatio === 'landscape') {
            const imageBoxWidth = CANVAS_WIDTH / 2;
            this.drawImageCover(this.ctx, this.state.beforeImage, 0, imageAreaY, imageBoxWidth, imageAreaHeight, this.state.beforeImageX, this.state.beforeImageY, this.state.beforeImageZoom);
            this.drawImageCover(this.ctx, this.state.afterImage, imageBoxWidth, imageAreaY, imageBoxWidth, imageAreaHeight, this.state.afterImageX, this.state.afterImageY, this.state.afterImageZoom);
        } else {
            const imageBoxHeight = imageAreaHeight / 2;
            this.drawImageCover(this.ctx, this.state.beforeImage, 0, imageAreaY, CANVAS_WIDTH, imageBoxHeight, this.state.beforeImageX, this.state.beforeImageY, this.state.beforeImageZoom);
            this.drawImageCover(this.ctx, this.state.afterImage, 0, imageAreaY + imageBoxHeight, CANVAS_WIDTH, imageBoxHeight, this.state.afterImageX, this.state.afterImageY, this.state.afterImageZoom);
        }
        
        // Draw watermark for free users
        if (this.state.logoImage && !this.isProUser) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.15;
            const watermarkMaxSize = CANVAS_WIDTH / 3;
            const logoAspectRatio = this.state.logoImage.width / this.state.logoImage.height;
            let watermarkWidth = watermarkMaxSize;
            let watermarkHeight = watermarkMaxSize / logoAspectRatio;
            
            if (watermarkHeight > imageAreaHeight * 0.8) {
                watermarkHeight = imageAreaHeight * 0.8;
                watermarkWidth = watermarkHeight * logoAspectRatio;
            }
            
            const watermarkX = (CANVAS_WIDTH - watermarkWidth) / 2;
            const watermarkY = HEADER_HEIGHT + (imageAreaHeight - watermarkHeight) / 2;
            this.ctx.drawImage(this.state.logoImage, watermarkX, watermarkY, watermarkWidth, watermarkHeight);
            this.ctx.restore();
        }

        // Draw labels
        const drawLabel = (text, xPos, yPos) => {
            this.ctx.font = `bold 24px '${this.state.font}', sans-serif`;
            const textMetrics = this.ctx.measureText(text);
            const labelWidth = textMetrics.width + 30;
            const labelHeight = 40;
            
            this.ctx.fillStyle = this.state.brandColor + 'BF';
            this.ctx.beginPath();
            this.ctx.roundRect(xPos, yPos, labelWidth, labelHeight, [8]);
            this.ctx.fill();
            
            this.ctx.fillStyle = LABEL_COLOR;
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(text, xPos + 15, yPos + labelHeight / 2);
        };

        if (this.state.aspectRatio === 'landscape') {
            drawLabel('Before', PADDING / 2, HEADER_HEIGHT + PADDING / 2);
            drawLabel('After', (CANVAS_WIDTH / 2) + PADDING / 2, HEADER_HEIGHT + PADDING / 2);
        } else {
            drawLabel('Before', PADDING / 2, HEADER_HEIGHT + PADDING / 2);
            drawLabel('After', PADDING / 2, HEADER_HEIGHT + (CANVAS_HEIGHT - HEADER_HEIGHT)/2 + PADDING/2);
        }

        // Draw differences box
        if (this.state.differences) {
            const lines = this.state.differences.split('\n');
            const fontSize = 22;
            this.ctx.font = `400 ${fontSize}px '${this.state.font}', sans-serif`;
            const lineHeight = fontSize * 1.4;
            const boxPadding = 20;
            const maxWidth = CANVAS_WIDTH / 2.5;
            
            let boxHeight = (lines.length * lineHeight) + (boxPadding * 2);
            let boxWidth = 0;
            
            lines.forEach(line => {
                const lineWidth = this.ctx.measureText(`• ${line}`).width;
                if (lineWidth > boxWidth) boxWidth = lineWidth;
            });
            
            boxWidth += boxPadding * 2;
            if (boxWidth > maxWidth) boxWidth = maxWidth;

            const boxX = CANVAS_WIDTH - boxWidth - PADDING / 2;
            const boxY = CANVAS_HEIGHT - boxHeight - PADDING / 2;
            
            const r = parseInt(this.state.differencesBoxColor.slice(1, 3), 16);
            const g = parseInt(this.state.differencesBoxColor.slice(3, 5), 16);
            const b = parseInt(this.state.differencesBoxColor.slice(5, 7), 16);
            
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
            this.ctx.beginPath();
            this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, [8]);
            this.ctx.fill();

            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            
            lines.forEach((line, index) => {
                this.ctx.fillText(`• ${line}`, boxX + boxPadding, boxY + boxPadding + (index * lineHeight));
            });
        }
        
        // Draw "Made with" branding for free users
        if (!this.isProUser) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.font = `18px '${this.state.font}', sans-serif`;
            this.ctx.textAlign = 'right';
            this.ctx.fillText('Made with Before & After Pro', CANVAS_WIDTH - PADDING / 2, CANVAS_HEIGHT - PADDING / 2);
        }
    }

    debouncedUpdateCanvas() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.updateCanvas();
        }, 100);
    }

    generateFilename(extension) {
        const clinic = this.state.clinicName.replace(/\s+/g, '-') || 'clinic';
        const treatment = this.state.treatmentName.replace(/\s+/g, '-') || 'treatment';
        const patient = this.state.patientName.replace(/\s+/g, '-') || 'patient';
        const date = this.state.treatmentDate || new Date().toISOString().split('T')[0];
        return `${clinic}_${treatment}_${patient}_${date}.${extension}`;
    }

    handleExport() {
        if (!this.isProUser) {
            let exportCount = parseInt(localStorage.getItem('exportCount') || '0');
            if (exportCount >= 3) {
                alert('You have reached your limit of 3 free exports. Please upgrade to Pro for unlimited exports.');
                return;
            }
            exportCount++;
            localStorage.setItem('exportCount', exportCount);
        }

        this.updateCanvas();
        
        // Create download link
        const link = document.createElement('a');
        link.download = this.generateFilename('png');
        link.href = this.elements.canvas.toDataURL('image/png');
        link.click();
    }

    resetApp() {
        // Reset state
        Object.assign(this.state, {
            beforeImage: null,
            afterImage: null,
            logoImage: null,
            clinicName: '',
            treatmentName: '',
            patientName: '',
            treatmentDate: '',
            brandColor: '#000000',
            textColor: '#1e293b',
            differences: '',
            differencesBoxColor: '#000000',
            beforeImageY: 0.5,
            afterImageY: 0.5,
            beforeImageX: 0.5,
            afterImageX: 0.5,
            beforeImageZoom: 1,
            afterImageZoom: 1
        });

        // Reset UI
        this.elements.clinicNameInput.value = '';
        this.elements.treatmentNameInput.value = '';
        this.elements.patientNameInput.value = '';
        this.elements.treatmentDateInput.value = '';
        this.elements.brandColorText.value = '#000000';
        this.elements.brandColorPicker.value = '#000000';
        this.elements.textColorText.value = '#1e293b';
        this.elements.textColorPicker.value = '#1e293b';
        this.elements.boxColorText.value = '#000000';
        this.elements.boxColorPicker.value = '#000000';
        this.elements.differencesText.value = '';
        this.elements.presetNameInput.value = '';
        
        // Reset color previews
        this.elements.brandColorPreview.style.backgroundColor = '#000000';
        this.elements.textColorPreview.style.backgroundColor = '#1e293b';
        this.elements.boxColorPreview.style.backgroundColor = '#000000';
        
        // Reset file inputs
        this.elements.beforeUpload.value = '';
        this.elements.afterUpload.value = '';
        this.elements.logoUpload.value = '';
        
        // Reset previews
        this.elements.beforePreview.classList.add('hidden');
        this.elements.afterPreview.classList.add('hidden');
        this.elements.logoPreview.classList.add('hidden');
        
        // Reset sliders
        this.elements.beforeSliderContainer.classList.add('hidden');
        this.elements.afterSliderContainer.classList.add('hidden');
        this.elements.beforeYSlider.disabled = true;
        this.elements.afterYSlider.disabled = true;
        this.elements.beforeXSlider.disabled = true;
        this.elements.afterXSlider.disabled = true;
        this.elements.beforeZoomSlider.disabled = true;
        this.elements.afterZoomSlider.disabled = true;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
        this.elements.previewPlaceholder.classList.remove('hidden');
        this.elements.exportBtn.disabled = true;
    }

    // Preset functions
    async presetFromState() {
        return {
            clinicName: this.state.clinicName,
            treatmentName: this.state.treatmentName,
            font: this.state.font,
            brandColor: this.state.brandColor,
            textColor: this.state.textColor,
            differencesBoxColor: this.state.differencesBoxColor,
            aspectRatio: this.state.aspectRatio,
        };
    }

    async applyPreset(preset) {
        if (!preset) return;
        
        // Handle both local and database presets
        const presetData = preset.data || preset;
        
        Object.assign(this.state, {
            clinicName: presetData.clinicName || '',
            treatmentName: presetData.treatmentName || '',
            font: presetData.font || 'Inter',
            brandColor: presetData.brandColor || '#000000',
            textColor: presetData.textColor || '#1e293b',
            differencesBoxColor: presetData.differencesBoxColor || '#000000',
            aspectRatio: presetData.aspectRatio || 'square',
        });

        // Update UI controls
        this.elements.clinicNameInput.value = this.state.clinicName;
        this.elements.treatmentNameInput.value = this.state.treatmentName;
        this.elements.fontSelector.value = this.state.font;
        this.elements.brandColorPicker.value = this.elements.brandColorText.value = this.state.brandColor;
        this.elements.textColorPicker.value = this.elements.textColorText.value = this.state.textColor;
        this.elements.boxColorPicker.value = this.elements.boxColorPicker.value = this.state.differencesBoxColor;

        // Update aspect ratio radio
        const radioButton = document.querySelector(`input[name="aspectRatio"][value="${this.state.aspectRatio}"]`);
        if (radioButton) radioButton.click();

        // Update color previews
        this.elements.brandColorPreview.style.backgroundColor = this.state.brandColor;
        this.elements.textColorPreview.style.backgroundColor = this.state.textColor;
        this.elements.boxColorPreview.style.backgroundColor = this.state.differencesBoxColor;
        
        this.updateCanvas();
    }

    async getAllPresets() {
        // Try to get from database first, fallback to localStorage
        if (authService.isAuthenticated()) {
            try {
                const dbPresets = await presetService.getUserPresets();
                if (dbPresets.length > 0) {
                    return dbPresets;
                }
            } catch (error) {
                console.warn('Failed to load database presets, using local:', error);
            }
        }
        
        // Fallback to localStorage
        try { 
            return JSON.parse(localStorage.getItem('presets') || '{}'); 
        } catch { 
            return {}; 
        }
    }

    async setAllPresets(presets) {
        if (authService.isAuthenticated()) {
            try {
                // Save to database
                for (const preset of Object.values(presets)) {
                    await presetService.savePreset({
                        name: preset.name || preset.clinicName,
                        data: preset
                    });
                }
            } catch (error) {
                console.warn('Failed to save to database, using localStorage:', error);
                localStorage.setItem('presets', JSON.stringify(presets));
            }
        } else {
            localStorage.setItem('presets', JSON.stringify(preset));
        }
    }

    async refreshPresetSelect() {
        const presets = await this.getAllPresets();
        this.elements.presetSelect.innerHTML = '<option value="">Load preset…</option>';
        
        if (Array.isArray(presets)) {
            // Database presets
            presets.forEach(preset => {
                const opt = document.createElement('option');
                opt.value = preset.id;
                opt.textContent = preset.name;
                this.elements.presetSelect.appendChild(opt);
            });
        } else {
            // Local presets
            Object.keys(presets).forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                this.elements.presetSelect.appendChild(opt);
            });
        }
    }

    async savePreset() {
        const name = (this.elements.presetNameInput.value || '').trim();
        if (!name) {
            alert('Please name your preset first');
            return;
        }
        
        if (authService.isAuthenticated()) {
            try {
                const presetData = await this.presetFromState();
                await presetService.savePreset({
                    name: name,
                    data: presetData
                });
                alert('✅ Preset saved to cloud');
            } catch (error) {
                console.error('Failed to save to database:', error);
                alert('❌ Failed to save to cloud, saving locally');
                // Fallback to local storage
                const presets = this.getAllPresets();
                presets[name] = this.presetFromState();
                this.setAllPresets(presets);
            }
        } else {
            // Save locally
            const presets = this.getAllPresets();
            presets[name] = this.presetFromState();
            this.setAllPresets(presets);
            alert('✅ Preset saved locally (login to sync to cloud)');
        }
        
        this.refreshPresetSelect();
    }

    async loadPreset(name) {
        if (!name) return;
        
        if (authService.isAuthenticated()) {
            try {
                // Try to load from database
                const preset = await presetService.getPresetById(name);
                if (preset) {
                    this.applyPreset(preset);
                    this.elements.presetNameInput.value = preset.name;
                    return;
                }
            } catch (error) {
                console.warn('Failed to load from database:', error);
            }
        }
        
        // Fallback to local presets
        const presets = this.getAllPresets();
        this.applyPreset(presets[name]);
        this.elements.presetNameInput.value = name;
    }

    async deletePreset(name) {
        if (!name) {
            alert('Please select a preset to delete');
            return;
        }
        
        if (authService.isAuthenticated()) {
            try {
                // Try to delete from database
                await presetService.deletePreset(name);
                alert('✅ Preset deleted from cloud');
            } catch (error) {
                console.error('Failed to delete from database:', error);
                alert('❌ Failed to delete from cloud');
                return;
            }
        } else {
            // Delete locally
            if (confirm(`Are you sure you want to delete "${name}"?`)) {
                const presets = this.getAllPresets();
                delete presets[name];
                this.setAllPresets(presets);
                alert('✅ Preset deleted locally');
            }
        }
        
        this.refreshPresetSelect();
        this.elements.presetSelect.value = '';
    }

    exportPreset() {
        const name = (this.elements.presetSelect.value || this.elements.presetNameInput.value || 'preset').replace(/\s+/g, '-');
        const blob = new Blob([JSON.stringify(this.presetFromState(), null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name}.bapreset.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    importPreset(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const preset = JSON.parse(reader.result);
                const name = prompt('Name this preset:', file.name.replace(/\.bapreset\.json$/, ''));
                if (!name) return;
                
                const presets = this.getAllPresets();
                presets[name] = preset;
                this.setAllPresets(presets);
                this.refreshPresetSelect();
                this.applyPreset(preset);
                alert('✅ Preset imported and applied');
            } catch {
                alert('❌ Invalid preset file');
            }
        };
        reader.readAsText(file);
    }

    saveLastUsed() {
        localStorage.setItem('last_used', JSON.stringify(this.presetFromState()));
    }

    loadLastUsed() {
        try {
            const lastUsed = JSON.parse(localStorage.getItem('last_used'));
            if (lastUsed) {
                this.applyPreset(lastUsed);
            }
        } catch {}
    }

    setupPlanFeatures() {
        const urlParams = new URLSearchParams(window.location.search);
        const proKey = urlParams.get('key');
        this.isProUser = proKey === 'PRO-ALPHA-2025';

        const proFeatureWrappers = [
            document.getElementById('preset-section'),
            this.elements.patientNameInput.parentElement,
            this.elements.brandColorText.parentElement.parentElement,
            this.elements.textColorText.parentElement.parentElement,
            this.elements.boxColorText.parentElement.parentElement,
            this.elements.differencesText.parentElement,
            document.querySelector('h4:nth-of-type(6)'), // Image Positioning Title
            this.elements.beforeSliderContainer,
            this.elements.beforeSliderContainer,
        ];

        // Check if user has pro subscription
        if (authService.isAuthenticated()) {
            authService.hasProSubscription().then(hasPro => {
                this.isProUser = hasPro;
                this.updateProFeatures();
            });
        }

        // Setup upgrade button click handler
        if (this.elements.upgradeBtn) {
            this.elements.upgradeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleUpgrade();
            });
        }

        this.updateProFeatures();
    }

    updateProFeatures() {
        const proFeatureWrappers = [
            document.getElementById('preset-section'),
            this.elements.patientNameInput.parentElement,
            this.elements.brandColorText.parentElement.parentElement,
            this.elements.textColorText.parentElement.parentElement,
            this.elements.boxColorText.parentElement.parentElement,
            this.elements.differencesText.parentElement,
            document.querySelector('h4:nth-of-type(6)'), // Image Positioning Title
            this.elements.beforeSliderContainer,
            this.elements.afterSliderContainer,
        ];

        if (this.isProUser) {
            this.elements.planPill.textContent = 'Pro Plan';
            this.elements.planPill.classList.replace('bg-slate-200', 'bg-green-100');
            this.elements.planPill.classList.replace('text-slate-700', 'text-green-800');
            this.elements.upgradeBtn.classList.add('hidden');
            
            // Enable pro features
            proFeatureWrappers.forEach(el => {
                if (el) {
                    el.style.opacity = '1';
                    el.style.pointerEvents = 'auto';
                    el.title = '';
                }
            });
        } else {
            this.elements.planPill.textContent = 'Free Plan';
            this.elements.planPill.classList.replace('bg-green-100', 'bg-slate-200');
            this.elements.planPill.classList.replace('text-green-800', 'text-slate-700');
            this.elements.upgradeBtn.classList.remove('hidden');
            
            // Disable pro features
            proFeatureWrappers.forEach(el => {
                if (el) {
                    el.style.opacity = '0.5';
                    el.style.pointerEvents = 'none';
                    el.title = 'Upgrade to Pro to use this feature.';
                }
            });
        }
    }

    async handleUpgrade() {
        if (!authService.isAuthenticated()) {
            // Show login modal first
            authUI.showLoginModal();
            return;
        }

        // Redirect to existing Stripe payment link
        window.open('https://buy.stripe.com/7sY28tbfjfVj8Kt3V90x200', '_blank');
        
        // Show success message
        alert('Redirecting to payment page... Please complete your purchase and refresh the page to unlock Pro features.');
    }

    setupAutoSave() {
        ['input', 'change'].forEach(evt => {
            document.body.addEventListener(evt, () => {
                setTimeout(() => this.saveLastUsed(), 0);
            }, true);
        });
    }

    setupDragAndDrop() {
        const setupDragAndDrop = (container, input) => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.classList.add('dragover');
            });
            
            container.addEventListener('dragleave', () => {
                container.classList.remove('dragover');
            });
            
            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('dragover');
                input.files = e.dataTransfer.files;
                const changeEvent = new Event('change', { bubbles: true });
                input.dispatchEvent(changeEvent);
            });
        };

        setupDragAndDrop(document.getElementById('before-container'), this.elements.beforeUpload);
        setupDragAndDrop(document.getElementById('after-container'), this.elements.afterUpload);
        setupDragAndDrop(document.getElementById('logo-container'), this.elements.logoUpload);
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S to save preset
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.savePreset();
        }
        
        // Ctrl/Cmd + Z to reset (not undo, but reset)
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            this.resetApp();
        }
        
        // Ctrl/Cmd + Enter to export
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!this.elements.exportBtn.disabled) {
                this.handleExport();
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BeforeAfterApp();
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 