// Before & After Pro - Simplified Version (No Modules)
// This version works without ES6 imports to restore core functionality

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
    }

    bindEvents() {
        // Image upload events
        if (this.elements.beforeUpload) {
            this.elements.beforeUpload.addEventListener('change', (e) => this.handleImageUpload(e, 'before'));
        }
        if (this.elements.afterUpload) {
            this.elements.afterUpload.addEventListener('change', (e) => this.handleImageUpload(e, 'after'));
        }
        if (this.elements.logoUpload) {
            this.elements.logoUpload.addEventListener('change', (e) => this.handleImageUpload(e, 'logo'));
        }

        // Text input events
        if (this.elements.clinicNameInput) {
            this.elements.clinicNameInput.addEventListener('input', (e) => this.updateState('clinicName', e.target.value));
        }
        if (this.elements.treatmentNameInput) {
            this.elements.treatmentNameInput.addEventListener('input', (e) => this.updateState('treatmentName', e.target.value));
        }
        if (this.elements.patientNameInput) {
            this.elements.patientNameInput.addEventListener('input', (e) => this.updateState('patientName', e.target.value));
        }
        if (this.elements.treatmentDateInput) {
            this.elements.treatmentDateInput.addEventListener('input', (e) => this.updateState('treatmentDate', e.target.value));
        }
        if (this.elements.differencesText) {
            this.elements.differencesText.addEventListener('input', (e) => this.updateState('differences', e.target.value));
        }

        // Color picker events
        if (this.elements.brandColorPicker) {
            this.elements.brandColorPicker.addEventListener('change', (e) => this.updateState('brandColor', e.target.value));
        }
        if (this.elements.textColorPicker) {
            this.elements.textColorPicker.addEventListener('change', (e) => this.updateState('textColor', e.target.value));
        }
        if (this.elements.boxColorPicker) {
            this.elements.boxColorPicker.addEventListener('change', (e) => this.updateState('differencesBoxColor', e.target.value));
        }

        // Format and font events
        if (this.elements.formatSelector) {
            this.elements.formatSelector.addEventListener('change', (e) => this.updateState('aspectRatio', e.target.value));
        }
        if (this.elements.fontSelector) {
            this.elements.fontSelector.addEventListener('change', (e) => this.updateState('font', e.target.value));
        }

        // Export button
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportImage());
        }

        // Reset button
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.resetCanvas());
        }

        // Preset events
        if (this.elements.presetSaveBtn) {
            this.elements.presetSaveBtn.addEventListener('click', () => this.savePreset());
        }
        if (this.elements.presetSelect) {
            this.elements.presetSelect.addEventListener('change', (e) => this.loadPreset(e.target.value));
        }
        if (this.elements.presetDeleteBtn) {
            this.elements.presetDeleteBtn.addEventListener('click', () => this.deletePreset());
        }
        if (this.elements.presetExportBtn) {
            this.elements.presetExportBtn.addEventListener('click', () => this.exportPreset());
        }
        if (this.elements.presetImportInput) {
            this.elements.presetImportInput.addEventListener('change', (e) => this.importPreset(e));
        }

        // Slider events
        if (this.elements.beforeYSlider) {
            this.elements.beforeYSlider.addEventListener('input', (e) => this.updateState('beforeImageY', parseFloat(e.target.value)));
        }
        if (this.elements.afterYSlider) {
            this.elements.afterYSlider.addEventListener('input', (e) => this.updateState('afterImageY', parseFloat(e.target.value)));
        }
        if (this.elements.beforeXSlider) {
            this.elements.beforeXSlider.addEventListener('input', (e) => this.updateState('beforeImageX', parseFloat(e.target.value)));
        }
        if (this.elements.afterXSlider) {
            this.elements.afterXSlider.addEventListener('input', (e) => this.updateState('afterImageX', parseFloat(e.target.value)));
        }
        if (this.elements.beforeZoomSlider) {
            this.elements.beforeZoomSlider.addEventListener('input', (e) => this.updateState('beforeImageZoom', parseFloat(e.target.value)));
        }
        if (this.elements.afterZoomSlider) {
            this.elements.afterZoomSlider.addEventListener('input', (e) => this.updateState('afterImageZoom', parseFloat(e.target.value)));
        }
    }

    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.state[`${type}Image`] = img;
                this.updatePreview(type, img);
                this.renderCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    updatePreview(type, img) {
        const previewElement = this.elements[`${type}Preview`];
        if (previewElement) {
            previewElement.src = img.src;
            previewElement.style.display = 'block';
        }
    }

    updateState(key, value) {
        this.state[key] = value;
        this.renderCanvas();
        this.saveLastUsed();
    }

    renderCanvas() {
        const canvas = this.elements.canvas;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { aspectRatio } = this.state;

        // Set canvas size based on aspect ratio
        let width, height;
        switch (aspectRatio) {
            case 'square':
                width = height = 800;
                break;
            case 'portrait':
                width = 640;
                height = 800;
                break;
            case 'landscape':
                width = 800;
                height = 640;
                break;
            default:
                width = height = 800;
        }

        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw images if available
        if (this.state.beforeImage) {
            this.drawImage(ctx, this.state.beforeImage, 0, 0, width / 2, height, this.state.beforeImageX, this.state.beforeImageY, this.state.beforeImageZoom);
        }
        if (this.state.afterImage) {
            this.drawImage(ctx, this.state.afterImage, width / 2, 0, width / 2, height, this.state.afterImageX, this.state.afterImageY, this.state.afterImageZoom);
        }

        // Draw text
        this.drawText(ctx, width, height);

        // Draw logo if available
        if (this.state.logoImage) {
            this.drawLogo(ctx, width, height);
        }

        // Hide placeholder
        if (this.elements.previewPlaceholder) {
            this.elements.previewPlaceholder.style.display = 'none';
        }
    }

    drawImage(ctx, img, x, y, width, height, centerX, centerY, zoom) {
        const imgWidth = img.width * zoom;
        const imgHeight = img.height * zoom;
        
        const sourceX = (img.width - imgWidth) * centerX;
        const sourceY = (img.height - imgHeight) * centerY;
        
        ctx.drawImage(img, sourceX, sourceY, imgWidth, imgHeight, x, y, width, height);
    }

    drawText(ctx, width, height) {
        const { clinicName, treatmentName, patientName, treatmentDate, font, textColor, brandColor, differences, differencesBoxColor } = this.state;

        ctx.font = `bold 24px ${font}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';

        // Draw clinic name
        if (clinicName) {
            ctx.fillText(clinicName, width / 2, 30);
        }

        // Draw treatment name
        if (treatmentName) {
            ctx.fillText(treatmentName, width / 2, 60);
        }

        // Draw patient name and date
        if (patientName || treatmentDate) {
            const patientText = patientName ? `Patient: ${patientName}` : '';
            const dateText = treatmentDate ? `Date: ${treatmentDate}` : '';
            const combinedText = [patientText, dateText].filter(Boolean).join(' | ');
            ctx.fillText(combinedText, width / 2, height - 40);
        }

        // Draw differences box
        if (differences) {
            const boxWidth = width * 0.8;
            const boxHeight = 60;
            const boxX = (width - boxWidth) / 2;
            const boxY = height - 120;

            // Draw box background
            ctx.fillStyle = differencesBoxColor;
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            // Draw text
            ctx.fillStyle = '#ffffff';
            ctx.font = `16px ${font}`;
            ctx.fillText(differences, width / 2, boxY + 35);
        }
    }

    drawLogo(ctx, width, height) {
        const logoSize = 60;
        const logoX = width - logoSize - 20;
        const logoY = 20;

        ctx.drawImage(this.state.logoImage, logoX, logoY, logoSize, logoSize);
    }

    exportImage() {
        const canvas = this.elements.canvas;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `before-after-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    resetCanvas() {
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

        // Clear file inputs
        if (this.elements.beforeUpload) this.elements.beforeUpload.value = '';
        if (this.elements.afterUpload) this.elements.afterUpload.value = '';
        if (this.elements.logoUpload) this.elements.logoUpload.value = '';

        // Clear text inputs
        if (this.elements.clinicNameInput) this.elements.clinicNameInput.value = '';
        if (this.elements.treatmentNameInput) this.elements.treatmentNameInput.value = '';
        if (this.elements.patientNameInput) this.elements.patientNameInput.value = '';
        if (this.elements.treatmentDateInput) this.elements.treatmentDateInput.value = '';
        if (this.elements.differencesText) this.elements.differencesText.value = '';

        // Clear previews
        if (this.elements.beforePreview) this.elements.beforePreview.style.display = 'none';
        if (this.elements.afterPreview) this.elements.afterPreview.style.display = 'none';
        if (this.elements.logoPreview) this.elements.logoPreview.style.display = 'none';

        // Show placeholder
        if (this.elements.previewPlaceholder) {
            this.elements.previewPlaceholder.style.display = 'block';
        }

        this.renderCanvas();
    }

    setupPlanFeatures() {
        // For now, enable all features (Pro mode)
        this.isProUser = true;
        if (this.elements.planPill) {
            this.elements.planPill.textContent = 'Pro';
            this.elements.planPill.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700';
        }
    }

    loadLastUsed() {
        try {
            const saved = localStorage.getItem('beforeAfterLastUsed');
            if (saved) {
                const data = JSON.parse(saved);
                Object.assign(this.state, data);
                this.updateUIFromState();
            }
        } catch (error) {
            console.log('Error loading last used state:', error);
        }
    }

    saveLastUsed() {
        try {
            localStorage.setItem('beforeAfterLastUsed', JSON.stringify(this.state));
        } catch (error) {
            console.log('Error saving last used state:', error);
        }
    }

    updateUIFromState() {
        // Update text inputs
        if (this.elements.clinicNameInput) this.elements.clinicNameInput.value = this.state.clinicName;
        if (this.elements.treatmentNameInput) this.elements.treatmentNameInput.value = this.state.treatmentName;
        if (this.elements.patientNameInput) this.elements.patientNameInput.value = this.state.patientName;
        if (this.elements.treatmentDateInput) this.elements.treatmentDateInput.value = this.state.treatmentDate;
        if (this.elements.differencesText) this.elements.differencesText.value = this.state.differences;

        // Update color inputs
        if (this.elements.brandColorPicker) this.elements.brandColorPicker.value = this.state.brandColor;
        if (this.elements.textColorPicker) this.elements.textColorPicker.value = this.state.textColor;
        if (this.elements.boxColorPicker) this.elements.boxColorPicker.value = this.state.differencesBoxColor;

        // Update sliders
        if (this.elements.beforeYSlider) this.elements.beforeYSlider.value = this.state.beforeImageY;
        if (this.elements.afterYSlider) this.elements.afterYSlider.value = this.state.afterImageY;
        if (this.elements.beforeXSlider) this.elements.beforeXSlider.value = this.state.beforeImageX;
        if (this.elements.afterXSlider) this.elements.afterXSlider.value = this.state.afterImageX;
        if (this.elements.beforeZoomSlider) this.elements.beforeZoomSlider.value = this.state.beforeImageZoom;
        if (this.elements.afterZoomSlider) this.elements.afterZoomSlider.value = this.state.afterImageZoom;

        this.renderCanvas();
    }

    refreshPresetSelect() {
        // Simple preset functionality using localStorage
        const presets = this.getAllPresets();
        const select = this.elements.presetSelect;
        if (!select) return;

        select.innerHTML = '<option value="">Select a preset...</option>';
        presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.name;
            option.textContent = preset.name;
            select.appendChild(option);
        });
    }

    getAllPresets() {
        try {
            const saved = localStorage.getItem('beforeAfterPresets');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    }

    setAllPresets(presets) {
        try {
            localStorage.setItem('beforeAfterPresets', JSON.stringify(presets));
        } catch (error) {
            console.log('Error saving presets:', error);
        }
    }

    savePreset() {
        const name = this.elements.presetNameInput?.value;
        if (!name) {
            alert('Please enter a preset name');
            return;
        }

        const presets = this.getAllPresets();
        const existingIndex = presets.findIndex(p => p.name === name);
        
        const preset = {
            name,
            state: { ...this.state }
        };

        if (existingIndex >= 0) {
            presets[existingIndex] = preset;
        } else {
            presets.push(preset);
        }

        this.setAllPresets(presets);
        this.refreshPresetSelect();
        
        if (this.elements.presetNameInput) {
            this.elements.presetNameInput.value = '';
        }
        
        alert('Preset saved!');
    }

    loadPreset(name) {
        if (!name) return;

        const presets = this.getAllPresets();
        const preset = presets.find(p => p.name === name);
        
        if (preset) {
            Object.assign(this.state, preset.state);
            this.updateUIFromState();
            alert('Preset loaded!');
        }
    }

    deletePreset() {
        const name = this.elements.presetSelect?.value;
        if (!name) {
            alert('Please select a preset to delete');
            return;
        }

        if (confirm(`Delete preset "${name}"?`)) {
            const presets = this.getAllPresets();
            const filtered = presets.filter(p => p.name !== name);
            this.setAllPresets(filtered);
            this.refreshPresetSelect();
            alert('Preset deleted!');
        }
    }

    exportPreset() {
        const name = this.elements.presetSelect?.value;
        if (!name) {
            alert('Please select a preset to export');
            return;
        }

        const presets = this.getAllPresets();
        const preset = presets.find(p => p.name === name);
        
        if (preset) {
            const dataStr = JSON.stringify(preset);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${name}.json`;
            link.click();
            URL.revokeObjectURL(url);
        }
    }

    importPreset(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const preset = JSON.parse(e.target.result);
                const presets = this.getAllPresets();
                presets.push(preset);
                this.setAllPresets(presets);
                this.refreshPresetSelect();
                alert('Preset imported!');
            } catch (error) {
                alert('Invalid preset file');
            }
        };
        reader.readAsText(file);
    }

    setupDragAndDrop() {
        // Basic drag and drop functionality
        const containers = ['before-container', 'after-container', 'logo-container'];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (!container) return;

            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.classList.add('border-indigo-500');
            });

            container.addEventListener('dragleave', () => {
                container.classList.remove('border-indigo-500');
            });

            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('border-indigo-500');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const type = containerId.replace('-container', '');
                    const input = document.getElementById(`${type}-upload`);
                    if (input) {
                        input.files = files;
                        input.dispatchEvent(new Event('change'));
                    }
                }
            });
        });
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveLastUsed();
        }, 30000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.BeforeAfterApp = new BeforeAfterApp();
    console.log('✅ Before & After App initialized successfully!');
}); 