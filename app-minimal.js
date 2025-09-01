// Minimal Before & After App - Core functionality only
console.log('🚀 Loading minimal app...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, initializing app...');
    
    // Get essential elements
    const beforeUpload = document.getElementById('before-upload');
    const afterUpload = document.getElementById('after-upload');
    const logoUpload = document.getElementById('logo-upload');
    const canvas = document.getElementById('canvas');
    const exportBtn = document.getElementById('export-btn');
    const clinicNameInput = document.getElementById('clinic-name');
    const treatmentNameInput = document.getElementById('treatment-name');
    
    console.log('📋 Elements found:', {
        beforeUpload: !!beforeUpload,
        afterUpload: !!afterUpload,
        logoUpload: !!logoUpload,
        canvas: !!canvas,
        exportBtn: !!exportBtn,
        clinicNameInput: !!clinicNameInput,
        treatmentNameInput: !!treatmentNameInput
    });
    
    // State
    let state = {
        beforeImage: null,
        afterImage: null,
        logoImage: null,
        clinicName: '',
        treatmentName: '',
        aspectRatio: 'square'
    };
    
    // Handle image uploads
    function handleImageUpload(event, type) {
        console.log('📸 Image upload:', type, event.target.files[0]);
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                state[`${type}Image`] = img;
                console.log('✅ Image loaded:', type, img.width, 'x', img.height);
                renderCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // Render canvas
    function renderCanvas() {
        if (!canvas) {
            console.log('❌ Canvas not found');
            return;
        }
        
        console.log('🎨 Rendering canvas...');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 800;
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 800);
        
        // Draw images
        if (state.beforeImage) {
            ctx.drawImage(state.beforeImage, 0, 0, 400, 800);
            console.log('✅ Drew before image');
        }
        
        if (state.afterImage) {
            ctx.drawImage(state.afterImage, 400, 0, 400, 800);
            console.log('✅ Drew after image');
        }
        
        // Draw text
        ctx.font = 'bold 24px Inter';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        
        if (state.clinicName) {
            ctx.fillText(state.clinicName, 400, 30);
        }
        
        if (state.treatmentName) {
            ctx.fillText(state.treatmentName, 400, 60);
        }
        
        console.log('✅ Canvas rendered');
    }
    
    // Export image
    function exportImage() {
        if (!canvas) return;
        
        console.log('📤 Exporting image...');
        const link = document.createElement('a');
        link.download = `before-after-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        console.log('✅ Image exported');
    }
    
    // Bind events
    if (beforeUpload) {
        beforeUpload.addEventListener('change', (e) => handleImageUpload(e, 'before'));
        console.log('✅ Before upload listener added');
    }
    
    if (afterUpload) {
        afterUpload.addEventListener('change', (e) => handleImageUpload(e, 'after'));
        console.log('✅ After upload listener added');
    }
    
    if (logoUpload) {
        logoUpload.addEventListener('change', (e) => handleImageUpload(e, 'logo'));
        console.log('✅ Logo upload listener added');
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportImage);
        console.log('✅ Export button listener added');
    }
    
    if (clinicNameInput) {
        clinicNameInput.addEventListener('input', (e) => {
            state.clinicName = e.target.value;
            renderCanvas();
        });
        console.log('✅ Clinic name listener added');
    }
    
    if (treatmentNameInput) {
        treatmentNameInput.addEventListener('input', (e) => {
            state.treatmentName = e.target.value;
            renderCanvas();
        });
        console.log('✅ Treatment name listener added');
    }
    
    // Initial render
    renderCanvas();
    
    console.log('🎉 Minimal app initialized successfully!');
    
    // Test function
    window.testApp = function() {
        console.log('🧪 Testing app...');
        console.log('State:', state);
        console.log('Canvas:', canvas);
        renderCanvas();
    };
}); 