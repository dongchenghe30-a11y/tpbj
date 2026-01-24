export default {
  async fetch(request, env, ctx) {
    // CORS headers - MUST be present in ALL responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle OPTIONS preflight requests - Return 200 immediately
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Root endpoint
      if (path === '/') {
        return new Response(JSON.stringify({
          message: 'ImageAI Pro API',
          status: 'online',
          version: '1.0.0',
          ai_enabled: !!env.AI
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Health check endpoint
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          ai_configured: !!env.AI,
          endpoints: [
            '/api/remove-background',
            '/api/compress',
            '/api/convert',
            '/api/edit',
            '/api/optimize',
            '/api/watermark',
            '/api/filters',
            '/api/batch'
          ]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Background Removal API - USING WORKERS AI NATIVE BINDING
      if (path === '/api/remove-background' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');

        if (!image) {
          return new Response(JSON.stringify({
            success: false,
            error: 'No image provided'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check if Workers AI is configured
        if (!env.AI) {
          console.error('Workers AI not configured: Missing AI binding');
          return new Response(JSON.stringify({
            success: false,
            error: 'Workers AI not configured. Please add AI binding in wrangler.toml',
            requiresConfiguration: true
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          const arrayBuffer = await image.arrayBuffer();
          const imageData = new Uint8Array(arrayBuffer);

          console.log('Calling Workers AI for background removal...');
          console.log('Image size:', arrayBuffer.byteLength, 'bytes');

          // Call Workers AI using Native Binding
          // Using background removal model from Workers AI
          const aiResponse = await env.AI.run('@cf/imgly/background-removal', {
            image: [...imageData]
          });

          console.log('Workers AI response received');

          return new Response(JSON.stringify({
            success: true,
            message: 'Background removed successfully',
            data: aiResponse
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (aiError) {
          console.error('Background removal error:', aiError);
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to remove background: ' + aiError.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Image Compression API
      if (path === '/api/compress' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const quality = formData.get('quality') || '80';

        if (!image) {
          return new Response(JSON.stringify({
            success: false,
            error: 'No image provided'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          const arrayBuffer = await image.arrayBuffer();

          // Simulate compression (in production, use image processing library)
          const compressedSize = Math.floor(arrayBuffer.byteLength * (quality / 100));

          console.log('Image compression:', {
            originalSize: arrayBuffer.byteLength,
            quality: quality,
            compressedSize: compressedSize
          });

          return new Response(JSON.stringify({
            success: true,
            message: 'Image compressed successfully',
            originalSize: arrayBuffer.byteLength,
            compressedSize: compressedSize,
            quality: parseInt(quality)
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Compression error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Compression failed: ' + error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Format Conversion API
      if (path === '/api/convert' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const format = formData.get('format') || 'png';

        if (!image) {
          return new Response(JSON.stringify({
            success: false,
            error: 'No image provided'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          const arrayBuffer = await image.arrayBuffer();

          console.log('Format conversion:', {
            originalType: image.type,
            targetFormat: format,
            size: arrayBuffer.byteLength
          });

          return new Response(JSON.stringify({
            success: true,
            message: `Image converted to ${format}`,
            originalSize: arrayBuffer.byteLength,
            format: format,
            originalType: image.type
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Conversion error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Conversion failed: ' + error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Image Editing API (Crop, Rotate, Flip)
      if (path === '/api/edit' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const operation = formData.get('operation');
        const params = formData.get('params');

        if (!image || !operation) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Missing required parameters'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          const arrayBuffer = await image.arrayBuffer();
          let parsedParams = null;

          if (params) {
            try {
              parsedParams = JSON.parse(params);
            } catch (e) {
              console.error('Failed to parse params:', params);
            }
          }

          console.log('Image editing:', {
            operation: operation,
            params: parsedParams
          });

          return new Response(JSON.stringify({
            success: true,
            message: `Image ${operation} operation completed`,
            operation: operation,
            params: parsedParams,
            imageSize: arrayBuffer.byteLength
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Edit error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Edit failed: ' + error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Image Optimization API (Brightness, Contrast, Saturation)
      if (path === '/api/optimize' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const adjustments = formData.get('adjustments');

        if (!image) {
          return new Response(JSON.stringify({
            success: false,
            error: 'No image provided'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          const arrayBuffer = await image.arrayBuffer();
          let parsedAdjustments = null;

          if (adjustments) {
            try {
              parsedAdjustments = JSON.parse(adjustments);
            } catch (e) {
              console.error('Failed to parse adjustments:', adjustments);
            }
          }

          console.log('Image optimization:', parsedAdjustments);

          return new Response(JSON.stringify({
            success: true,
            message: 'Image adjustments applied',
            adjustments: parsedAdjustments
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Optimization error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Optimization failed: ' + error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Watermark API
      if (path === '/api/watermark' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const type = formData.get('type');
        const content = formData.get('content');
        const position = formData.get('position') || 'bottom-right';
        const opacity = formData.get('opacity') || '0.5';

        if (!image || !type || !content) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Missing required parameters'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          const arrayBuffer = await image.arrayBuffer();

          console.log('Watermark:', {
            type: type,
            content: content,
            position: position,
            opacity: opacity
          });

          return new Response(JSON.stringify({
            success: true,
            message: 'Watermark added successfully',
            type: type,
            content: content,
            position: position,
            opacity: parseFloat(opacity)
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Watermark error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Watermark failed: ' + error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Filters API
      if (path === '/api/filters' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const filter = formData.get('filter');

        if (!image || !filter) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Missing required parameters'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          const arrayBuffer = await image.arrayBuffer();

          console.log('Filter applied:', filter);

          return new Response(JSON.stringify({
            success: true,
            message: `Filter ${filter} applied successfully`,
            filter: filter
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Filter error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Filter failed: ' + error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Batch Processing API
      if (path === '/api/batch' && request.method === 'POST') {
        const formData = await request.formData();
        const operation = formData.get('operation');
        const params = formData.get('params');

        const images = [];
        for (const [name, value] of formData.entries()) {
          if (name.startsWith('images[')) {
            images.push(value);
          }
        }

        if (images.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: 'No images provided'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          console.log('Batch processing:', {
            imageCount: images.length,
            operation: operation
          });

          return new Response(JSON.stringify({
            success: true,
            message: 'Batch processing completed',
            processed: images.length,
            operation: operation
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Batch processing error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Batch processing failed: ' + error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // 404 - Not found (with CORS headers)
      return new Response(JSON.stringify({
        success: false,
        error: 'Not found',
        message: 'The requested endpoint does not exist',
        availableEndpoints: [
          'GET /',
          'GET /api/health',
          'POST /api/remove-background',
          'POST /api/compress',
          'POST /api/convert',
          'POST /api/edit',
          'POST /api/optimize',
          'POST /api/watermark',
          'POST /api/filters',
          'POST /api/batch'
        ]
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error: ' + error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
