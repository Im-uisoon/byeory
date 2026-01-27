-- 🎨 Custom Widgets Seed Data
-- Run this SQL to insert the requested "Living Widgets" into your database.
-- Note: Adjust 'users' to match your user ID if necessary.

-- 1. 🐈 Dancing Cat (Living Sticker)
INSERT INTO widgets (name, type, content, styles, decorations, default_size, created_at, updated_at, users, download_count, is_shared)
VALUES (
  'Dancing Cat',
  'custom-block',
  '{
    "scenes": [
      {
        "id": "scene-1",
        "duration": 1,
        "decorations": [
          {
            "id": "cat-deco",
            "type": "text",
            "text": "🐈",
            "x": 15,
            "y": 15,
            "w": 70,
            "h": 70,
            "animation": { "type": "bounce", "duration": 1, "delay": 0 }
          }
        ]
      }
    ]
  }',
  '{}',
  '[
    {
      "id": "cat-deco",
      "type": "text",
      "text": "🐈",
      "x": 15,
      "y": 15,
      "w": 70,
      "h": 70,
      "animation": { "type": "bounce", "duration": 1, "delay": 0 }
    }
  ]',
  '1x1',
  NOW(),
  NOW(),
  1,
  0,
  false
);

-- 2. ☕ Floating Coffee (Living Sticker)
INSERT INTO widgets (name, type, content, styles, decorations, default_size, created_at, updated_at, users, download_count, is_shared)
VALUES (
  'Morning Coffee',
  'custom-block',
  '{
    "scenes": [
      {
        "id": "scene-1",
        "duration": 1,
        "decorations": [
          {
            "id": "coffee-deco",
            "type": "text",
            "text": "☕",
            "x": 20,
            "y": 20,
            "w": 60,
            "h": 60,
            "animation": { "type": "float", "duration": 3, "delay": 0 }
          }
        ]
      }
    ]
  }',
  '{}',
  '[
    {
      "id": "coffee-deco",
      "type": "text",
      "text": "☕",
      "x": 20,
      "y": 20,
      "w": 60,
      "h": 60,
      "animation": { "type": "float", "duration": 3, "delay": 0 }
    }
  ]',
  '1x1',
  NOW(),
  NOW(),
  1,
  0,
  false
);

-- 3. ☀️ Sunny Stamp (Mood Stamp)
INSERT INTO widgets (name, type, content, styles, decorations, default_size, created_at, updated_at, users, download_count, is_shared)
VALUES (
  'Sunny Stamp',
  'custom-block',
  '{
    "scenes": [
      {
        "id": "scene-1",
        "duration": 1,
        "decorations": [
          {
            "id": "sun-deco",
            "type": "text",
            "text": "☀️",
            "x": 10,
            "y": 10,
            "w": 80,
            "h": 80,
            "animation": { "type": "spin", "duration": 10, "delay": 0 }
          }
        ]
      }
    ]
  }',
  '{}',
  '[
    {
      "id": "sun-deco",
      "type": "text",
      "text": "☀️",
      "x": 10,
      "y": 10,
      "w": 80,
      "h": 80,
      "animation": { "type": "spin", "duration": 10, "delay": 0 }
    }
  ]',
  '1x1',
  NOW(),
  NOW(),
  1,
  0,
  false
);

-- 4. 💯 Good Job Stamp (Mood Stamp)
INSERT INTO widgets (name, type, content, styles, decorations, default_size, created_at, updated_at, users, download_count, is_shared)
VALUES (
  'Good Job Stamp',
  'custom-block',
  '{
    "scenes": [
      {
        "id": "scene-1",
        "duration": 1,
        "decorations": [
          {
            "id": "good-job-deco",
            "type": "text",
            "text": "💯",
            "x": 15,
            "y": 15,
            "w": 70,
            "h": 70,
            "animation": { "type": "pulse", "duration": 1.5, "delay": 0 },
            "style": { "transform": "rotate(-15deg)" }
          }
        ]
      }
    ]
  }',
  '{}',
  '[
    {
      "id": "good-job-deco",
      "type": "text",
      "text": "💯",
      "x": 15,
      "y": 15,
      "w": 70,
      "h": 70,
      "animation": { "type": "pulse", "duration": 1.5, "delay": 0 },
      "style": { "transform": "rotate(-15deg)" }
    }
  ]',
  '1x1',
  NOW(),
  NOW(),
  1,
  0,
  false
);

-- 5. 🎀 Washi Tape - Blue Check (Decoration)
INSERT INTO widgets (name, type, content, styles, decorations, default_size, created_at, updated_at, users, download_count, is_shared)
VALUES (
  'Washi Tape - Blue',
  'custom-block',
  '{
    "scenes": [
      {
        "id": "scene-1",
        "duration": 1,
        "decorations": [
          {
            "id": "tape-deco",
            "type": "shape",
            "x": 5,
            "y": 40,
            "w": 90,
            "h": 20,
            "style": {
              "background": "repeating-linear-gradient(45deg, #a5b4fc, #a5b4fc 10px, #818cf8 10px, #818cf8 20px)",
              "boxShadow": "2px 2px 5px rgba(0,0,0,0.1)",
              "opacity": "0.9"
            }
          }
        ]
      }
    ]
  }',
  '{}',
  '[
    {
      "id": "tape-deco",
      "type": "shape",
      "x": 5,
      "y": 40,
      "w": 90,
      "h": 20,
      "style": {
        "background": "repeating-linear-gradient(45deg, #a5b4fc, #a5b4fc 10px, #818cf8 10px, #818cf8 20px)",
        "boxShadow": "2px 2px 5px rgba(0,0,0,0.1)",
        "opacity": "0.9"
      }
    }
  ]',
  '2x1',
  NOW(),
  NOW(),
  1,
  0,
  false
);

-- 6. 🏷️ Kraft Memo (Decoration)
INSERT INTO widgets (name, type, content, styles, decorations, default_size, created_at, updated_at, users, download_count, is_shared)
VALUES (
  'Kraft Memo',
  'custom-block',
  '{
    "scenes": [
      {
        "id": "scene-1",
        "duration": 1,
        "decorations": [
          {
            "id": "memo-bg",
            "type": "shape",
            "x": 10,
            "y": 10,
            "w": 80,
            "h": 80,
            "style": {
              "backgroundColor": "#d4c5b0",
              "boxShadow": "3px 3px 8px rgba(0,0,0,0.15)",
              "backgroundImage": "linear-gradient(#0000000d 1px, transparent 1px)",
              "backgroundSize": "100% 20px"
            }
          },
          {
            "id": "memo-tape",
            "type": "shape",
            "x": 35,
            "y": 5,
            "w": 30,
            "h": 10,
            "style": {
              "backgroundColor": "rgba(255,255,255,0.4)",
              "transform": "rotate(-5deg)"
            }
          },
          {
            "id": "memo-text",
            "type": "text",
            "text": "To Do",
            "x": 15,
            "y": 25,
            "w": 70,
            "h": 20,
            "style": {
                "fontFamily": "serif",
                "fontSize": "14px",
                "color": "#5a4a3a"
            }
          }
        ]
      }
    ]
  }',
  '{}',
  '[
    {
      "id": "memo-bg",
      "type": "shape",
      "x": 10,
      "y": 10,
      "w": 80,
      "h": 80,
      "style": {
        "backgroundColor": "#d4c5b0",
        "boxShadow": "3px 3px 8px rgba(0,0,0,0.15)",
        "backgroundImage": "linear-gradient(#0000000d 1px, transparent 1px)",
        "backgroundSize": "100% 20px"
      }
    },
    {
      "id": "memo-tape",
      "type": "shape",
      "x": 35,
      "y": 5,
      "w": 30,
      "h": 10,
      "style": {
        "backgroundColor": "rgba(255,255,255,0.4)",
        "transform": "rotate(-5deg)"
      }
    },
    {
      "id": "memo-text",
      "type": "text",
      "text": "To Do",
      "x": 15,
      "y": 25,
      "w": 70,
      "h": 20,
      "style": {
          "fontFamily": "serif",
          "fontSize": "14px",
          "color": "#5a4a3a"
      }
    }
  ]',
  '2x2',
  NOW(),
  NOW(),
  1,
  0,
  false
);

-- 7. 📸 Polaroid Frame
INSERT INTO widgets (name, type, content, styles, decorations, default_size, created_at, updated_at, users, download_count, is_shared)
VALUES (
  'Polaroid Frame',
  'custom-block',
  '{
    "scenes": [
      {
        "id": "scene-1",
        "duration": 1,
        "decorations": [
          {
            "id": "polaroid-bg",
            "type": "shape",
            "x": 0,
            "y": 0,
            "w": 100,
            "h": 100,
            "style": {
              "backgroundColor": "#ffffff",
              "boxShadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              "borderRadius": "2px"
            }
          },
          {
            "id": "polaroid-photo",
            "type": "image",
            "x": 5,
            "y": 5,
            "w": 90,
            "h": 75,
            "imageUrl": "",
            "style": {
              "backgroundColor": "#f3f4f6",
              "objectFit": "cover"
            }
          },
          {
            "id": "polaroid-text",
            "type": "text",
            "text": "My Memory",
            "x": 10,
            "y": 85,
            "w": 80,
            "h": 10,
            "style": {
                "fontFamily": "cursive",
                "fontSize": "16px",
                "textAlign": "center",
                "color": "#374151"
            }
          }
        ]
      }
    ]
  }',
  '{}',
  '[
    {
      "id": "polaroid-bg",
      "type": "shape",
      "x": 0,
      "y": 0,
      "w": 100,
      "h": 100,
      "style": {
        "backgroundColor": "#ffffff",
        "boxShadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "borderRadius": "2px"
      }
    },
    {
      "id": "polaroid-photo",
      "type": "image",
      "x": 5,
      "y": 5,
      "w": 90,
      "h": 75,
      "imageUrl": "",
      "style": {
        "backgroundColor": "#f3f4f6",
        "objectFit": "cover"
      }
    },
    {
      "id": "polaroid-text",
      "type": "text",
      "text": "My Memory",
      "x": 10,
      "y": 85,
      "w": 80,
      "h": 10,
      "style": {
          "fontFamily": "cursive",
          "fontSize": "16px",
          "textAlign": "center",
          "color": "#374151"
      }
    }
  ]',
  '2x2',
  NOW(),
  NOW(),
  1,
  0,
  false
);
