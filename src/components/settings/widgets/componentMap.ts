import React, { lazy } from 'react';

// --------------------------------------------------------------------------
// Component Map
// --------------------------------------------------------------------------
// Vite의 정적 분석을 위해 모든 import 경로를 풀어서 작성해야 합니다.
export const WIDGET_COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
    // ======================================================================
    // System (Deprecated / Moved)
    // ======================================================================
    // 'welcome' moved to Utility
    // 'theme-guide', 'feature-card' deleted

    // ======================================================================
    // Data & Logic
    // ======================================================================
    'formula-block': lazy(() => import('./widgetCollection/logic/FormulaBlock.tsx').then(m => ({ default: m.FormulaBlock }))),

    // ======================================================================
    // Diary & Emotion
    // ======================================================================
    'chat-diary': lazy(() => import('./widgetCollection/diary/ChatDiary.tsx').then(m => ({ default: m.ChatDiary }))),
    'mood-analytics': lazy(() => import('./widgetCollection/diary/MoodAnalytics.tsx').then(m => ({ default: m.MoodAnalytics }))),
    'word-mind-map': lazy(() => import('./widgetCollection/diary/WordMindMapWidget.tsx').then(m => ({ default: m.WordMindMapWidget }))),
    'random-diary': lazy(() => import('./widgetCollection/diary/RandomDiary.tsx').then(m => ({ default: m.RandomDiary }))),

    // ======================================================================
    // Utility
    // ======================================================================
    'welcome': lazy(() => import('./widgetCollection/system/Welcome.tsx').then(m => ({ default: m.WelcomeWidget }))),
    'todo-list': lazy(() => import('./widgetCollection/tools/TodoList.tsx').then(m => ({ default: m.TodoListWidget }))),
    'weather': lazy(() => import('./widgetCollection/tools/Weather.tsx').then(m => ({ default: m.WeatherWidget }))),
    // 'notification': removed
    'clock': lazy(() => import('./widgetCollection/tools/Clock.tsx').then(m => ({ default: m.ClockWidget }))),


    'streak': lazy(() => import('./widgetCollection/tools/Streak.tsx').then(m => ({ default: m.StreakWidget }))),

    'battery': lazy(() => import('./widgetCollection/tools/Battery.tsx').then(m => ({ default: m.BatteryWidget }))),
    'worry-shredder': lazy(() => import('./widgetCollection/tools/WorryShredder.tsx').then(m => ({ default: m.WorryShredder }))),
    'scrap-note': lazy(() => import('./widgetCollection/tools/ScrapNote.tsx').then(m => ({ default: m.ScrapNote }))),
    'recipe-card': lazy(() => import('./widgetCollection/tools/RecipeCard.tsx').then(m => ({ default: m.RecipeCard }))),
    'worry-doll': lazy(() => import('./widgetCollection/tools/WorryDoll.tsx').then(m => ({ default: m.WorryDoll }))),
    'unit-converter': lazy(() => import('./widgetCollection/tools/UnitConverter.tsx').then(m => ({ default: m.UnitConverter }))),
    'calculator': lazy(() => import('./widgetCollection/tools/Calculator.tsx').then(m => ({ default: m.Calculator }))),
    'random-picker': lazy(() => import('./widgetCollection/tools/RandomPicker.tsx').then(m => ({ default: m.RandomPicker }))),
    'map-pin': lazy(() => import('./widgetCollection/tools/MapPin.tsx').then(m => ({ default: m.MapPin }))),
    'rss-reader': lazy(() => import('./widgetCollection/tools/RSSReader.tsx').then(m => ({ default: m.RSSReader }))),
    'tag-cloud': lazy(() => import('./widgetCollection/tools/TagCloud.tsx').then(m => ({ default: m.TagCloud }))),
    'color-palette': lazy(() => import('./widgetCollection/tools/ColorPalette.tsx').then(m => ({ default: m.ColorPalette }))),
    'typewriter': lazy(() => import('./widgetCollection/tools/Typewriter.tsx').then(m => ({ default: m.Typewriter }))),
    'polaroid': lazy(() => import('./widgetCollection/tools/Polaroid.tsx').then(m => ({ default: m.Polaroid }))),

    // ======================================================================
    // Decoration & Collection
    // ======================================================================
    'photo-gallery': lazy(() => import('./widgetCollection/decoration/Gallery.tsx').then(m => ({ default: m.PhotoGallery }))),
    'instant-booth': lazy(() => import('./widgetCollection/decoration/Gallery.tsx').then(m => ({ default: m.InstantBooth }))),
    'film-strip': lazy(() => import('./widgetCollection/decoration/Gallery.tsx').then(m => ({ default: m.FilmStrip }))),
    'moon-phase': lazy(() => import('./widgetCollection/decoration/MoonPhase.tsx').then(m => ({ default: m.MoonPhase }))),
    'switch-board': lazy(() => import('./widgetCollection/decoration/SwitchBoard.tsx').then(m => ({ default: m.SwitchBoard }))),
    'fortune-cookie': lazy(() => import('./widgetCollection/decoration/FortuneCookie.tsx').then(m => ({ default: m.FortuneCookie }))),
    'ootd': lazy(() => import('./widgetCollection/decoration/OOTDSketch.tsx').then(m => ({ default: m.OOTDSketch }))),
    'book-cover': lazy(() => import('./widgetCollection/decoration/BookCover.tsx').then(m => ({ default: m.BookCover }))),
    'bubble-wrap': lazy(() => import('./widgetCollection/decoration/BubbleWrap.tsx').then(m => ({ default: m.BubbleWrap }))),
    'transparent': lazy(() => import('./widgetCollection/decoration/TransparentSpacer.tsx').then(m => ({ default: m.TransparentSpacer }))),
    'favorite-char': lazy(() => import('./widgetCollection/decoration/Character.tsx').then(m => ({ default: m.FavoriteCharacter }))),
    'color-chip': lazy(() => import('./widgetCollection/decoration/ColorChip.tsx').then(m => ({ default: m.ColorChip }))),
    'movie-scene': lazy(() => import('./widgetCollection/decoration/MovieScene.tsx').then(m => ({ default: m.MovieScene }))),
    'ticket': lazy(() => import('./widgetCollection/decoration/TicketStub.tsx').then(m => ({ default: m.TicketStub }))),
    'neon': lazy(() => import('./widgetCollection/decoration/NeonSign.tsx').then(m => ({ default: m.NeonSign }))),
    'candle': lazy(() => import('./widgetCollection/decoration/Candle.tsx').then(m => ({ default: m.Candle }))),
    'text-scroller': lazy(() => import('./widgetCollection/decoration/TextScroller.tsx').then(m => ({ default: m.TextScroller }))),
    'ocean-wave': lazy(() => import('./widgetCollection/decoration/OceanWave.tsx').then(m => ({ default: m.OceanWave }))),
    'movie-ticket': lazy(() => import('./widgetCollection/decoration/MovieTicket.tsx').then(m => ({ default: m.MovieTicket }))),
    'bookshelf': lazy(() => import('./widgetCollection/decoration/Bookshelf.tsx').then(m => ({ default: m.Bookshelf }))),
    'stamp-collection': lazy(() => import('./widgetCollection/decoration/StampCollection.tsx').then(m => ({ default: m.StampCollection }))),
    'sky-map': lazy(() => import('./widgetCollection/decoration/SkyMap.tsx').then(m => ({ default: m.SkyMap }))),
    'birth-flower': lazy(() => import('./widgetCollection/decoration/BirthFlower.tsx').then(m => ({ default: m.BirthFlower }))),
    'receipt-printer': lazy(() => import('./widgetCollection/decoration/ReceiptPrinter.tsx').then(m => ({ default: m.ReceiptPrinter }))),
    'weather-stickers': lazy(() => import('./widgetCollection/decoration/WeatherStickers.tsx').then(m => ({ default: m.WeatherStickers }))),

    // ======================================================================
    // Interactive
    // ======================================================================
    'dessert-case': lazy(() => import('./widgetCollection/interactive/DessertCase.tsx').then(m => ({ default: m.DessertCase }))),
    'cat-chaser': lazy(() => import('./widgetCollection/interactive/CatChaser.tsx').then(m => ({ default: m.CatChaser }))),
    'snow-globe': lazy(() => import('./widgetCollection/interactive/SnowGlobe.tsx').then(m => ({ default: m.SnowGlobe }))),
    'lp-player': lazy(() => import('./widgetCollection/interactive/LPPlayer.tsx').then(m => ({ default: m.LPPlayer }))),
    'bonfire': lazy(() => import('./widgetCollection/interactive/Bonfire.tsx').then(m => ({ default: m.Bonfire }))),
    'community': lazy(() => import('./widgetCollection/interactive/Community.tsx').then(m => ({ default: m.CommunityWidget }))),
    'time-machine': lazy(() => import('./widgetCollection/interactive/TimeMachine.tsx').then(m => ({ default: m.TimeMachine }))),
    'scratch-card': lazy(() => import('./widgetCollection/interactive/ScratchCard.tsx').then(m => ({ default: m.ScratchCard }))),
    'switches': lazy(() => import('./widgetCollection/interactive/Switches.tsx').then(m => ({ default: m.Switches }))),

    // ======================================================================
    // Global Controllers
    // ======================================================================
    'cursor-trail': lazy(() => import('./widgetCollection/controllers/CursorTrail.tsx').then(m => ({ default: m.CursorTrail }))),
    'highlighter': lazy(() => import('./widgetCollection/controllers/Highlighter.tsx').then(m => ({ default: m.Highlighter }))),
    'physics-box': lazy(() => import('./widgetCollection/controllers/PhysicsBox.tsx').then(m => ({ default: m.PhysicsBox }))),
    'magnifier': lazy(() => import('./widgetCollection/controllers/Magnifier.tsx').then(m => ({ default: m.Magnifier }))),
    'ruby-text': lazy(() => import('./widgetCollection/controllers/RubyText.tsx').then(m => ({ default: m.RubyText }))),
};