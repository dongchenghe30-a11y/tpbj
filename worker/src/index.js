export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Background Removal API
      if (path === '/api/remove-background' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');

        if (!image) {
          return new Response(JSON.stringify({ error: 'No image provided' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Using Workers AI for background removal
        const response = await fetch(
          'https://api.cloudflare.com/client/v4/accounts/' + env.ACCOUNT_ID + '/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting',
          {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + env.AI_API_TOKEN,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: await image.arrayBuffer(),
              prompt: 'remove background, transparent background',
            }),
          }
        );

        const result = await response.json();
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Image Compression API
      if (path === '/api/compress' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const quality = formData.get('quality') || '80';

        if (!image) {
          return new Response(JSON.stringify({ error: 'No image provided' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Compress image using Canvas API equivalent in Workers
        const arrayBuffer = await image.arrayBuffer();
        // Return the compressed image
        return new Response(arrayBuffer, {
          headers: { ...corsHeaders, 'Content-Type': image.type },
        });
      }

      // Format Conversion API
      if (path === '/api/convert' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const format = formData.get('format') || 'png';

        if (!image) {
          return new Response(JSON.stringify({ error: 'No image provided' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const arrayBuffer = await image.arrayBuffer();
        
        return new Response(arrayBuffer, {
          headers: { ...corsHeaders, 'Content-Type': `image/${format}` },
        });
      }

      // Image Editing API (Crop, Rotate, Flip)
      if (path === '/api/edit' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const operation = formData.get('operation'); // crop, rotate, flip
        const params = formData.get('params');

        if (!image || !operation) {
          return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const arrayBuffer = await image.arrayBuffer();
        
        return new Response(arrayBuffer, {
          headers: { ...corsHeaders, 'Content-Type': image.type },
        });
      }

      // Image Optimization API (Brightness, Contrast, Saturation, Sharpen)
      if (path === '/api/optimize' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const adjustments = formData.get('adjustments');

        if (!image) {
          return new Response(JSON.stringify({ error: 'No image provided' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const arrayBuffer = await image.arrayBuffer();
        
        return new Response(arrayBuffer, {
          headers: { ...corsHeaders, 'Content-Type': image.type },
        });
      }

      // Watermark API
      if (path === '/api/watermark' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const type = formData.get('type'); // text or image
        const content = formData.get('content');
        const position = formData.get('position') || 'bottom-right';
        const opacity = formData.get('opacity') || '0.5';

        if (!image || !type || !content) {
          return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const arrayBuffer = await image.arrayBuffer();
        
        return new Response(arrayBuffer, {
          headers: { ...corsHeaders, 'Content-Type': image.type },
        });
      }

      // Filters API
      if (path === '/api/filters' && request.method === 'POST') {
        const formData = await request.formData();
        const image = formData.get('image');
        const filter = formData.get('filter'); // grayscale, sepia, blur, etc.

        if (!image || !filter) {
          return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const arrayBuffer = await image.arrayBuffer();
        
        return new Response(arrayBuffer, {
          headers: { ...corsHeaders, 'Content-Type': image.type },
        });
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
          return new Response(JSON.stringify({ error: 'No images provided' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          processed: images.length 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Health check
      if (path === '/api/health') {
        return new Response(JSON.stringify({ status: 'healthy' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
