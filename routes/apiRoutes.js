const express = require('express');

const apiRoutesController = require('../controllers/apiRoutesController');

const router = express.Router();

// Downloader
router.get('/downloader/youtube-video', apiRoutesController.downloader_youtube_video);
router.get('/downloader/youtube-video-v2', apiRoutesController.downloader_youtube_video_v2);
router.get('/downloader/youtube-audio', apiRoutesController.downloader_youtube_audio);
router.get('/downloader/youtube-play-video', apiRoutesController.downloader_youtube_play_video);
router.get('/downloader/youtube-play-audio', apiRoutesController.downloader_youtube_play_audio);
router.get('/downloader/facebook-video', apiRoutesController.downloader_facebook);
router.get('/downloader/facebook-video-v2', apiRoutesController.downloader_facebook_v2);
router.get('/downloader/twitter', apiRoutesController.downloader_twitter);
router.get('/downloader/twitter-v2', apiRoutesController.downloader_twitter_v2);
router.get('/downloader/instagram', apiRoutesController.downloader_instagram);
router.get('/downloader/instagram-v2', apiRoutesController.downloader_instagram_v2);
router.get('/downloader/tiktok', apiRoutesController.downloader_tiktok);
router.get('/downloader/tiktok-v2', apiRoutesController.downloader_tiktok_v2);
router.get('/downloader/tiktok-v3', apiRoutesController.downloader_tiktok_v2);
router.get('/downloader/savefrom', apiRoutesController.downloader_savefrom);
router.get('/downloader/mediafire', apiRoutesController.downloader_mediafire);
router.get('/downloader/sfilemobi', apiRoutesController.downloader_sfilemobi);
router.get('/downloader/soundcloud', apiRoutesController.downloader_soundcloud);
router.get('/downloader/google-drive', apiRoutesController.downloader_google_drive);

// Searcher
router.get('/searcher/youtube', apiRoutesController.searcher_youtube);
router.get('/searcher/joox', apiRoutesController.searcher_joox);
router.get('/searcher/lyrics', apiRoutesController.searcher_lyrics);
router.get('/searcher/soundcloud', apiRoutesController.searcher_soundcloud);
router.get('/searcher/emoji', apiRoutesController.searcher_emoji);
router.get('/searcher/stack-overflow', apiRoutesController.searcher_stack_overflow);
router.get('/searcher/sfilemobi', apiRoutesController.searcher_sfilemobi);
router.get('/searcher/happymod', apiRoutesController.searcher_happymod);
router.get('/searcher/whatsapp-group', apiRoutesController.searcher_whatsapp_group);
router.get('/searcher/sticker', apiRoutesController.searcher_sticker);
router.get('/searcher/wallpaper', apiRoutesController.searcher_wallpaper);
router.get('/searcher/ringtone', apiRoutesController.searcher_ringtone);
router.get('/searcher/pinterest', apiRoutesController.searcher_pinterest);
router.get('/searcher/wikimedia', apiRoutesController.searcher_wikimedia);
router.get('/searcher/wikipedia', apiRoutesController.searcher_wikipedia);
router.get('/searcher/google-it', apiRoutesController.searcher_google_it);
router.get('/searcher/google-image', apiRoutesController.searcher_google_image);

// Stalker
router.get('/stalker/tiktok', apiRoutesController.stalker_tiktok);
router.get('/stalker/github-user', apiRoutesController.stalker_github_user);
router.get('/stalker/github-repo', apiRoutesController.stalker_github_repo);
router.get('/stalker/github-all-repo', apiRoutesController.stalker_github_show_all_repo);
router.get('/stalker/npmjs-package', apiRoutesController.stalker_npmjs_package);
router.get('/stalker/ip', apiRoutesController.stalker_ip);

// Artificial Intelligence
router.get('/artificial-intelligence/chatgpt-3', apiRoutesController.artificial_intelligence_openai_chatgpt_3);
router.get('/artificial-intelligence/chatgpt-35', apiRoutesController.artificial_intelligence_openai_chatgpt_35);
router.get('/artificial-intelligence/dalle-2', apiRoutesController.artificial_intelligence_openai_dalle_2);
router.get('/artificial-intelligence/chatty-ai', apiRoutesController.artificial_intelligence_chatty_ai);
router.get('/artificial-intelligence/bard', apiRoutesController.artificial_intelligence_google_bard);
router.get('/artificial-intelligence/simsimi', apiRoutesController.artificial_intelligence_simsimi);
router.get('/artificial-intelligence/midjourney', apiRoutesController.artificial_intelligence_midjourney);
router.get('/artificial-intelligence/stable-diffusion', apiRoutesController.artificial_intelligence_stable_diffusion);
router.get('/artificial-intelligence/ninja-diffusers', apiRoutesController.artificial_intelligence_ninja_diffusers);
router.get('/artificial-intelligence/theallys-mix', apiRoutesController.artificial_intelligence_theallys_mix);
router.get('/artificial-intelligence/coffe-mix', apiRoutesController.artificial_intelligence_coffe_mix);
router.get('/artificial-intelligence/anime-filter', apiRoutesController.artificial_intelligence_anime_filter);

// Canvas
router.get('/canvas/emoji-mix', apiRoutesController.canvas_emoji_mix);
router.get('/canvas/welcome', apiRoutesController.canvas_welcome);
router.get('/canvas/goodbye', apiRoutesController.canvas_goodbye);

// Maker
router.get('/maker/remove-bg', apiRoutesController.maker_remove_bg);
router.get('/maker/enhance', apiRoutesController.maker_enhance);
router.get('/maker/beautiful', apiRoutesController.maker_beautiful);
router.get('/maker/blur', apiRoutesController.maker_blur);
router.get('/maker/invert', apiRoutesController.maker_invert);
router.get('/maker/rainbow', apiRoutesController.maker_rainbow);
router.get('/maker/trigger', apiRoutesController.maker_trigger);
router.get('/maker/wanted', apiRoutesController.maker_wanted);
router.get('/maker/wasted', apiRoutesController.maker_wasted);
router.get('/maker/darkness', apiRoutesController.maker_darkness);
router.get('/maker/pixelate', apiRoutesController.maker_pixelate);

// PhotoOxy
router.get('/photooxy/realistic-flaming-text-effect', apiRoutesController.photooxy_realistic_flaming_text_effect);
router.get('/photooxy/write-stars-text-on-the-night-sky', apiRoutesController.photooxy_write_stars_text_on_the_night_sky);
router.get('/photooxy/shadow-text-effect-in-the-sky', apiRoutesController.photooxy_shadow_text_effect_in_the_sky);
router.get('/photooxy/write-text-on-burn-paper', apiRoutesController.photooxy_write_text_on_burn_paper);
router.get('/photooxy/make-quotes-under-grass', apiRoutesController.photooxy_make_quotes_under_grass);
router.get('/photooxy/creating-an-underwater-ocean', apiRoutesController.photooxy_creating_an_underwater_ocean);
router.get('/photooxy/3d-text-effect-under-white-cube', apiRoutesController.photooxy_3d_text_effect_under_white_cube);
router.get('/photooxy/put-any-text-in-to-coffee-cup', apiRoutesController.photooxy_put_any_text_in_to_coffee_cup);
router.get('/photooxy/make-smoky-neon-glow-effect', apiRoutesController.photooxy_make_smoky_neon_glow_effect);
router.get('/photooxy/rainbow-shine-text', apiRoutesController.photooxy_rainbow_shine_text);
router.get('/photooxy/army-camouflage-fabric-text-effect', apiRoutesController.photooxy_army_camouflage_fabric_text_effect);
router.get('/photooxy/create-a-3d-glowing-text-effect', apiRoutesController.photooxy_create_a_3d_glowing_text_effect);
router.get('/photooxy/honey-text-effect', apiRoutesController.photooxy_honey_text_effect);
router.get('/photooxy/vintage-text-style', apiRoutesController.photooxy_vintage_text_style);
router.get('/photooxy/gradient-avatar-text-effect', apiRoutesController.photooxy_gradient_avatar_text_effect);
router.get('/photooxy/fur-text-effect-generator', apiRoutesController.photooxy_fur_text_effect_generator);
router.get('/photooxy/striking-3d-text-effect', apiRoutesController.photooxy_striking_3d_text_effect);

// SFW
const animeSfwRoutes = [
  'akira', 'asuna', 'ana', 'akiyama', 'ayuzawa', 'boruto', 'chitanda', 'chitoge',
  'cosplay', 'deidara', 'doraemon', 'elaina', 'emilia', 'erza', 'fanart', 'genshin',
  'gremory', 'hestia', 'husbu', 'waifu', 'icon', 'inori', 'isuzu', 'itachi', 'itori',
  'kaga', 'kagura', 'kaguya', 'kakasih', 'kaneki', 'kaori', 'keneki', 'kotori',
  'kosaki', 'kuriyama', 'kuroha', 'kurumi', 'loli', 'madara', 'menus', 'mikasa',
  'miku', 'minato', 'naruto', 'natsukawa', 'neko', 'nekonime', 'nezuko', 'nishimiya',
  'onepiece', 'pokemon', 'rem', 'rize', 'sagiri', 'sakura', 'sasuke', 'shina',
  'shinka', 'shizuka', 'shota', 'simp', 'tomori', 'toukachan', 'tsunade',
  'yatogami', 'yuki'
];

animeSfwRoutes.forEach(route => {
  router.get(`/random-image/anime-sfw-${route}`, apiRoutesController[`random_image_anime_sfw_${route}`]);
});

// NSFW
const animeNsfwRoutes = [
  'ahegao', 'ass', 'bdsm', 'blowjob', 'cuckold', 'cum', 'eba', 'ero', 'femdom', 'foot',
  'gangbang', 'gifs', 'glasses', 'hentai', 'jahy', 'manga', 'masturbation', 'megumin',
  'neko', 'nekonime', 'loli', 'orgy', 'panties', 'pussy', 'tentacles', 'thighs',
  'yuri', 'zettai'
];

animeNsfwRoutes.forEach(route => {
  router.get(`/random-image/anime-nsfw-${route}`, apiRoutesController[`random_image_anime_nsfw_${route}`]);
});

// Check nickname game
router.get('/check-nickname/game-free-fire', apiRoutesController.check_nickname_game_free_fire);
router.get('/check-nickname/game-mobile-legends', apiRoutesController.check_nickname_game_mobile_legends);
router.get('/check-nickname/game-super-sus', apiRoutesController.check_nickname_game_super_sus);

// URL shortener
router.get('/url-shortener/bitly', apiRoutesController.url_shortener_bitly);
router.get('/url-shortener/cuttly', apiRoutesController.url_shortener_cuttly);
router.get('/url-shortener/tinyurl', apiRoutesController.url_shortener_tinyurl);
router.get('/url-shortener/tinyurl-with-alias', apiRoutesController.url_shortener_tinyurl_with_alias);
router.get('/url-shortener/tinyurl-resolve', apiRoutesController.url_shortener_tinyurl_resolve);

// Converter
router.get('/converter/text-to-image', apiRoutesController.converter_text_to_image);
router.get('/converter/text-to-gif', apiRoutesController.converter_text_to_gif);
router.get('/converter/text-to-speech', apiRoutesController.converter_text_to_speech);

// Tools
router.get('/tools/translate', apiRoutesController.tools_translate);
router.get('/tools/get-tempmail', apiRoutesController.tools_get_temp_mail);
router.get('/tools/get-tempmail-inbox', apiRoutesController.tools_get_temp_mail_inbox);
router.get('/tools/screenshot-website', apiRoutesController.tools_screenshot_website);
router.get('/tools/style-text', apiRoutesController.tools_style_text);
router.get('/tools/fetch', apiRoutesController.tools_fetch);
router.get('/tools/base64-encode', apiRoutesController.tools_base64_encode);
router.get('/tools/base64-decode', apiRoutesController.tools_base64_decode);
router.get('/tools/base32-encode', apiRoutesController.tools_base32_encode);
router.get('/tools/base32-decode', apiRoutesController.tools_base32_decode);

module.exports = router;