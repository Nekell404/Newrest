require('../config/appConfig');

const fs = require('fs');
const {
  promisify
} = require('util');
const writeFileAsync = promisify(fs.writeFile);
const path = require('path');
const daniScraper = require('@danitech/scraper');
const daniCodingScraper = require('@danicoding/scraper');
const {
  savefrom,
  wikipedia,
  googleIt,
  googleImage
} = require('@bochilteam/scraper');
const wibusoftScraper = require('wibusoft');
const {
  Configuration,
  OpenAIApi
} = require('openai');
const simSimi = require('simsimi-api');
const stableDiffusion = require('stable-diffusion-cjs');
const BitlyClient = require('bitly').BitlyClient;
const TinyURL = require('tinyurl');
const soundoftext = require('soundoftext-js');

const {
  checkAuth
} = require('../utils/functions');
const cwd = require('../utils/current-working-directory');

const db = require('./mySQLController');

// Downloader
exports.downloader_youtube_video = (req, res) => {
  const {
    video_url,
    api_key
  } = req.query;

  if (!video_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Video URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];
      
      nekellCodingScraper.downloader.youtube.video(video_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_youtube_video_v2 = (req, res) => {
  const {
    video_url,
    api_key
  } = req.query;

  if (!video_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Video URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(400).json({
        status: "Failed",
        code: 400,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.downloader.youtube_video(video_url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_youtube_audio = (req, res) => {
  const {
    video_url,
    api_key
  } = req.query;

  if (!video_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Video URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.downloader.youtube.audio(video_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_youtube_play_video = (req, res) => {
  const {
    video_title,
    api_key
  } = req.query;

  if (!video_title || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Video title or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.downloader.youtube.playvideo(video_title)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_youtube_play_audio = (req, res) => {
  const {
    video_title,
    api_key
  } = req.query;

  if (!video_title || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Video title or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.downloader.youtube.playaudio(video_title)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_facebook = (req, res) => {
  const {
    video_url,
    api_key
  } = req.query;

  if (!video_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Video URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.downloader.facebook(video_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_facebook_v2 = (req, res) => {
  const {
    video_url,
    api_key
  } = req.query;

  if (!video_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Video URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.downloader.facebook(video_url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_twitter = (req, res) => {
  const {
    target_url,
    api_key
  } = req.query;

  if (!target_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.downloader.twitter(target_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_twitter_v2 = (req, res) => {
  const {
    target_url,
    api_key
  } = req.query;

  if (!target_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.downloader.twitter(target_url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_instagram = (req, res) => {
  const {
    target_url,
    api_key
  } = req.query;

  if (!target_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.downloader.instagram(target_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_instagram_v2 = (req, res) => {
  const {
    target_url,
    api_key
  } = req.query;

  if (!target_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.downloader.instagram(target_url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_tiktok = (req, res) => {
  const {
    video_url,
    api_key
  } = req.query;

  if (!video_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Video URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.downloader.tiktok(video_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_tiktok_v2 = (req, res) => {
  const {
    video_url,
    api_key
  } = req.query;

  if (!video_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Video URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.downloader.tiktok(video_url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_tiktok_v3 = (req, res) => {
  const {
    video_url,
    api_key
  } = req.query;

  if (!video_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Video URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.downloader.tiktok_v2(video_url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_savefrom = (req, res) => {
  const {
    target_url,
    api_key
  } = req.query;

  if (!target_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      savefrom(target_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_mediafire = (req, res) => {
  const {
    file_url,
    api_key
  } = req.query;

  if (!file_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "File URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.downloader.mediafire(file_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_sfilemobi = (req, res) => {
  const {
    file_url,
    api_key
  } = req.query;

  if (!file_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "File URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.downloader.sfilemobi(file_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_soundcloud = (req, res) => {
  const {
    audio_url,
    api_key
  } = req.query;

  if (!audio_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Audio URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.downloader.soundcloud(audio_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.downloader_google_drive = (req, res) => {
  const {
    file_url,
    api_key
  } = req.query;

  if (!file_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "File URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.downloader.google_drive(file_url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

// Searcher
exports.searcher_youtube = (req, res) => {
  const {
    video_title,
    api_key
  } = req.query;

  if (!video_title || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Video title or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.search.youtube(video_title)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_joox = (req, res) => {
  const {
    audio_title,
    api_key
  } = req.query;

  if (!audio_title || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Audio title or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.search.joox(audio_title)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_lyrics = (req, res) => {
  const {
    song_title,
    api_key
  } = req.query;

  if (!song_title || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Song title or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.searcher.lyrics(song_title)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_soundcloud = (req, res) => {
  const {
    song_title,
    api_key
  } = req.query;

  if (!song_title || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Song title or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.searcher.soundcloud(song_title)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_emoji = (req, res) => {
  const {
    emoji_name,
    api_key
  } = req.query;

  if (!emoji_name || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Emoji name or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.searcher.emoji(emoji_name)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_stack_overflow = (req, res) => {
  const {
    post_title,
    api_key
  } = req.query;

  if (!post_title || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Post title or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.searcher.stackoverflow(post_title)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_sfilemobi = (req, res) => {
  const {
    file_name,
    api_key
  } = req.query;

  if (!file_name || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "File name or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.search.sfilemobi(file_name)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_happymod = (req, res) => {
  const {
    app_name,
    api_key
  } = req.query;

  if (!app_name || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "App name or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.search.happymod(app_name)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_whatsapp_group = (req, res) => {
  const {
    group_name,
    api_key
  } = req.query;

  if (!group_name || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Group name or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.search.groupwa(group_name)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_sticker = (req, res) => {
  const {
    sticker_name,
    api_key
  } = req.query;

  if (!sticker_name || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Sticker name or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.search.sticker(sticker_name)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_wallpaper = (req, res) => {
  const {
    wallpaper_name,
    api_key
  } = req.query;

  if (!wallpaper_name || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Wallpaper name or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.search.wallpaper(wallpaper_name)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_ringtone = (req, res) => {
  const {
    ringtone_name,
    api_key
  } = req.query;

  if (!ringtone_name || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Ringtone name or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.search.ringtone(ringtone_name)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_pinterest = (req, res) => {
  const {
    pint_search,
    api_key
  } = req.query;

  if (!pint_search || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Pint search or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.search.pinterest(pint_search)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_wikimedia = (req, res) => {
  const {
    wiki_search,
    api_key
  } = req.query;

  if (!wiki_search || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Wiki Search or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellCodingScraper.search.wikimedia(wiki_search)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_wikipedia = (req, res) => {
  const {
    wiki_search,
    language,
    api_key
  } = req.query;

  if (!wiki_search || !language || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Wiki search or Language or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      wikipedia(wiki_search, language)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_google_it = (req, res) => {
  const {
    gi_search,
    api_key
  } = req.query;

  if (!gi_search || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "GI search or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      googleIt(gi_search)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.searcher_google_image = (req, res) => {
  const {
    gi_search,
    api_key
  } = req.query;

  if (!gi_search || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "GI search or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      googleImage(gi_search)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

// Stalker
exports.stalker_tiktok = (req, res) => {
  const {
    username,
    api_key
  } = req.query;

  if (!username || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Username or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.stalker.tiktok(username)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.stalker_github_user = (req, res) => {
  const {
    username,
    api_key
  } = req.query;

  if (!username || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Username or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.stalker.github_user(username)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.stalker_github_repo = (req, res) => {
  const {
    username,
    repo_name,
    api_key
  } = req.query;

  if (!username || !repo_name || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Username, Repo name or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.stalker.github_repo(username, repo_name)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.stalker_github_show_all_repo = (req, res) => {
  const {
    username,
    api_key
  } = req.query;

  if (!username || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Username or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.stalker.github_show_all_repo(username)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.stalker_npmjs_package = (req, res) => {
  const {
    package_name,
    api_key
  } = req.query;

  if (!package_name || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Package name or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.stalker.npmjs_package(package_name)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.stalker_ip = (req, res) => {
  const {
    ip_address,
    api_key
  } = req.query;

  if (!ip_address || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "IP address or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.stalker.ip(ip_address)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

// Artificial Intelligence
exports.artificial_intelligence_openai_chatgpt_3 = (req, res) => {
  const {
    question,
    custom_question,
    custom_answer,
    api_key
  } = req.query;

  if (!question || !custom_question || !custom_answer || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Question, Custom question, Custom answer, or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.artificial_intelligence.chatgpt_3(question)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            const answer = (question === custom_question) ? custom_answer : data.data;
            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                question: question,
                answer: answer
              }
            })
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.artificial_intelligence_openai_chatgpt_35 = (req, res) => {
  const {
    question,
    custom_question,
    custom_answer,
    api_key
  } = req.query;

  if (!question || !custom_question || !custom_answer || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Question, Custom question, Custom answer, or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {
        if (chatgpt_free_mode) {
          nekellScraper.artificial_intelligence.chatgpt_35(question)
            .then(response => {
              if (!response.ok) {
                throw new Error("Request failed!");
              }
              return response.json();
            })
            .then(data => {
              if (!data) {
                return res.status(404).json({
                  status: "Failed",
                  code: 404,
                  message: "Data not found!"
                });
              } else {
                db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).json({
                      status: "Failed",
                      code: 500,
                      message: "An error occurred"
                    });
                  }
                });

                const answer = (question === custom_question) ? custom_answer : data.data;
                return res.status(200).json({
                  status: "Success",
                  code: 200,
                  author: web_set.author,
                  data: {
                    question: question,
                    answer: answer
                  }
                });
              }
            })
            .catch(err => {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            });
        } else {
          const configuration = new Configuration({
            apiKey: secret_key.openai
          });

          const openai = new OpenAIApi(configuration);

          openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'user',
              content: question
            }],
          }).then(gptResponse => {
            const answer = (question === custom_question) ? custom_answer : gptResponse.data.choices[0].message.content;

            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }

              return res.status(200).json({
                status: "Success",
                code: 200,
                author: web_set.author,
                data: {
                  question: question,
                  answer: answer
                }
              });
            });
          }).catch(err => {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          });
        }
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.artificial_intelligence_openai_dalle_2 = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {
        const configuration = new Configuration({
          apiKey: secret_key.openai
        });

        const openai = new OpenAIApi(configuration);

        openai.createImage({
          prompt: text,
          n: 1,
          size: 'auto'
        }).then(response => {
          const imageUrl = response.data.data[0].url;

          db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                image_url: imageUrl,
                size: 'auto'
              }
            });
          });
        }).catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.artificial_intelligence_chatty_ai = (req, res) => {
  const {
    question,
    api_key
  } = req.query;

  if (!question || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Question or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.artificial_intelligence.chatty_ai(question)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.artificial_intelligence_google_bard = (req, res) => {
  const {
    question,
    api_key
  } = req.query;

  if (!question || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Question or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.artificial_intelligence.bard(question)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                question: question,
                answer: data.respon
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.artificial_intelligence_simsimi = (req, res) => {
  const {
    question,
    language,
    api_key
  } = req.query;

  if (!question || !language || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Question, Language or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      simSimi.simtalk(question, language)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                ip: data.ip,
                time: data.time,
                languages: data.language,
                id: data.id,
                question: data.text,
                answer: data.message
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.artificial_intelligence_midjourney = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.artificial_intelligence.midjourney(text)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.artificial_intelligence_stable_diffusion = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        async function writeFile(path, filename, buffer) {
          const writeFile = await writeFileAsync(path + filename, buffer);
          return writeFile;
        };

        let prompt = text;
        const fileArray = [];

        stableDiffusion.generate(prompt, async (result) => {
          try {
            for (let i = 0; i < result.results.length; i++) {
              const data = result.results[i].split(",")[1];
              const buffer = Buffer.from(data, "base64");
              const filename = `/temp/stable-diffusion-image_${i + 1}.png`;
              writeFile(cwd, filename, buffer);
              const filePath = path.join(cwd, filename);
              fileArray.push(filePath);
            }

            res.on('finish', () => {
              fileArray.forEach((filePath) => {
                fs.unlink(filePath, (err) => {
                  if (err) {
                    console.error(`Failed to delete file: ${err}`);
                  } else {
                    console.log(`File deleted: ${filePath}`);
                  }
                });
              });
            });

            res.sendFile(fileArray[0], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "Internal server error!"
                });
              }
            });
          } catch (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "Internal server error!"
            });
          }
        });

      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.artificial_intelligence_ninja_diffusers = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        async function huggingFace(data) {
          const response = await fetch(
            "https://api-inference.huggingface.co/models/Yntec/Ninja-Diffusers", {
              headers: {
                Authorization: `Bearer ${secret_key.hf}`
              },
              method: "POST",
              body: JSON.stringify(data),
            }
          );
          const result = await response.blob();
          let arrayBuffer = await result.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer, "base64");
          return buffer;
        }
        huggingFace({
            "inputs": text
          }).then(async image => {
            res.set({
              'Content-Type': 'image/png'
            });
            res.send(image);
          })
          .catch(err => {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "Internal server error!"
            });
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.artificial_intelligence_theallys_mix = async (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        async function huggingFace(data) {
          const response = await fetch(
            "https://api-inference.huggingface.co/models/Yntec/theallysMixIV-verisimilar", {
              headers: {
                Authorization: `Bearer ${secret_key.hf}`
              },
              method: "POST",
              body: JSON.stringify(data),
            }
          );
          const result = await response.blob();
          let arrayBuffer = await result.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer, "base64");
          return buffer;
        }
        huggingFace({
            "inputs": text
          }).then(async image => {
            res.set({
              'Content-Type': 'image/png'
            });
            res.send(image);
          })
          .catch(err => {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "Internal server error!"
            });
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.artificial_intelligence_coffe_mix = async (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        async function huggingFace(data) {
          const response = await fetch(
            "https://api-inference.huggingface.co/models/digiplay/CoffeeMix_v2", {
              headers: {
                Authorization: `Bearer ${secret_key.hf}`
              },
              method: "POST",
              body: JSON.stringify(data),
            }
          );
          const result = await response.blob();
          let arrayBuffer = await result.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer, "base64");
          return buffer;
        }
        huggingFace({
            "inputs": text
          }).then(async image => {
            res.set({
              'Content-Type': 'image/png'
            });
            res.send(image);
          })
          .catch(err => {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "Internal server error!"
            });
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.artificial_intelligence_anime_filter = (req, res) => {
  const {
    image_url,
    api_key
  } = req.query;

  if (!image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.artificial_intelligence.anime_filter(image_url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });

      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

// Canvas
exports.canvas_emoji_mix = (req, res) => {
  const {
    emoji,
    emoji2,
    api_key
  } = req.query;

  if (!emoji || !emoji2 || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Emoji 1/2 or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        async function emojiMix(emoji, emoji2) {
          const data = await fetch('https://api-canvas.miftah.biz.id/api/maker/emojimix?emoji1=' + emoji + '&emoji2=' + emoji2);
          return data;
        };

        emojiMix(emoji, emoji2)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });

      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.canvas_welcome = (req, res) => {
  const {
    member_name,
    group_name,
    member_count,
    profile_picture_image_url,
    background_image_url,
    api_key
  } = req.query;

  if (!member_name || !group_name || !member_count || !profile_picture_image_url || !background_image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Member name, Group name, Member count, Profile picture image URL, Background image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        async function welcome(member_name, group_name, member_count, profile_picture_image_url, background_image_url) {
          const data = await fetch('https://api-canvas.miftah.biz.id/api/maker/welcome1?name=' + member_name + '&gpname=' + group_name + '&member=' + member_count + '&pp=' + profile_picture_image_url + '&bg=' + background_image_url);
          return data;
        };

        welcome(member_name, group_name, member_count, profile_picture_image_url, background_image_url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });

      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.canvas_goodbye = (req, res) => {
  const {
    member_name,
    group_name,
    member_count,
    profile_picture_image_url,
    background_image_url,
    api_key
  } = req.query;

  if (!member_name || !group_name || !member_count || !profile_picture_image_url || !background_image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Member name, Group name, Member count, Profile picture image URL, Background image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        async function goodBye(member_name, group_name, member_count, profile_picture_image_url, background_image_url) {
          const data = await fetch('https://api-canvas.miftah.biz.id/api/maker/goodbye1?name=' + member_name + '&gpname=' + group_name + '&member=' + member_count + '&pp=' + profile_picture_image_url + '&bg=' + background_image_url);
          return data;
        };

        goodBye(member_name, group_name, member_count, profile_picture_image_url, background_image_url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });

      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

// Maker
exports.maker_remove_bg = (req, res) => {
  const {
    image_url,
    api_key
  } = req.query;

  if (!image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        async function removeBackground(imageUrl, secretKeys, res) {
          try {
            const randomRemoveBgAccessToken = secretKeys.remove_bg[Math.floor(Math.random() * secretKeys.remove_bg.length)];

            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
              method: 'POST',
              headers: {
                'X-Api-Key': randomRemoveBgAccessToken,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image_url: imageUrl,
                size: 'auto'
              }),
            });

            const data = await response.buffer();
            res.type('png').send(data);
          } catch (err) {
            console.error(err);
            res.status(500).send('Terjadi kesalahan pada remove-bg.');
          }
        }

        removeBackground(image_url, secret_key, res);
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.maker_enhance = (req, res) => {
  const {
    image_url,
    api_key
  } = req.query;

  if (!image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.maker.enhance(image_url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });

      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.maker_beautiful = (req, res) => {
  const {
    image_url,
    api_key
  } = req.query;

  if (!image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.maker.beautiful(image_url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.maker_blur = (req, res) => {
  const {
    image_url,
    api_key
  } = req.query;

  if (!image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.maker.blur(image_url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.maker_invert = (req, res) => {
  const {
    image_url,
    api_key
  } = req.query;

  if (!image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.maker.invert(image_url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.maker_rainbow = (req, res) => {
  const {
    image_url,
    api_key
  } = req.query;

  if (!image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.maker.rainbow(image_url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.maker_trigger = (req, res) => {
  const {
    image_url,
    api_key
  } = req.query;

  if (!image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.maker.trigger(image_url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.maker_wanted = (req, res) => {
  const {
    image_url,
    api_key
  } = req.query;

  if (!image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.maker.wanted(image_url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.maker_wasted = (req, res) => {
  const {
    image_url,
    api_key
  } = req.query;

  if (!image_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.maker.wasted(image_url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.maker_darkness = (req, res) => {
  const {
    image_url,
    volume,
    api_key
  } = req.query;

  if (!image_url || !volume || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL, Volume or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.maker.darkness(image_url, volume)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.maker_pixelate = (req, res) => {
  const {
    image_url,
    volume,
    api_key
  } = req.query;

  if (!image_url || !volume || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Image URL, Volume or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.maker.pixelate(image_url, volume)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

// PhotoOxy
exports.photooxy_realistic_flaming_text_effect = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/realistic-flaming-text-effect-online-197' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_write_stars_text_on_the_night_sky = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/write-stars-text-on-the-night-sky-200' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_shadow_text_effect_in_the_sky = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/shadow-text-effect-in-the-sky-394' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_write_text_on_burn_paper = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/write-text-on-burn-paper-388' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_make_quotes_under_grass = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/make-quotes-under-grass-376' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_creating_an_underwater_ocean = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/creating-an-underwater-ocean-363' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_3d_text_effect_under_white_cube = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/3d-text-effect-under-white-cube-217' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_put_any_text_in_to_coffee_cup = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/put-any-text-in-to-coffee-cup-371' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_make_smoky_neon_glow_effect = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/make-smoky-neon-glow-effect-343' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_rainbow_shine_text = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/rainbow-shine-text-223' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_army_camouflage_fabric_text_effect = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/army-camouflage-fabric-text-effect-221' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_create_a_3d_glowing_text_effect = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/create-a-3d-glowing-text-effect-220' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_honey_text_effect = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/honey-text-effect-218' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_vintage_text_style = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/other-design' +
              '/vintage-text-style-219' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_gradient_avatar_text_effect = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/gradient-avatar-text-effect-207' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_fur_text_effect_generator = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/logo-and-text-effects' +
              '/fur-text-effect-generator-198' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.photooxy_striking_3d_text_effect = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          nekellCodingScraper.photooxy(
              'https://photooxy.com' +
              '/other-design' +
              '/striking-3d-text-effect-online-187' +
              '.html',
              [
                text
              ]
            )
            .then((data) => {
              res.set('Content-Type', 'image/png');
              res.send(data);
            })
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

// SFW
exports.random_image_anime_sfw_akira = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .akira();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_asuna = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .asuna();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_ana = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .ana();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_akiyama = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .akiyama();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_ayuzawa = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .ayuzawa();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_boruto = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .boruto();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_chitanda = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .chitanda();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_chitoge = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .chitoge();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_cosplay = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .cosplay();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_deidara = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .deidara();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_doraemon = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .doraemon();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_elaina = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .elaina();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_emilia = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .emilia();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_erza = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .erza();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_fanart = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .fanart();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_genshin = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .genshin();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_gremory = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .gremory();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_hestia = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .hestia();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_husbu = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .husbu();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_waifu = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .waifu();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_icon = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .icon();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_inori = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .inori();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_isuzu = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .isuzu();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_itachi = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .itachi();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_itori = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .itori();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_kaga = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .kaga();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_kagura = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .kagura();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_kaguya = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .kaguya();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_kakasih = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .kakasih();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_kaneki = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .kaneki();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_kaori = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .kaori();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_keneki = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .keneki();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_kotori = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .kotori();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_kosaki = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .kosaki();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_kuriyama = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .kuriyama();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_kuroha = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .kuroha();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_kurumi = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .kurumi();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_loli = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .loli();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_madara = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .madara();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_menus = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .menus();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_mikasa = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .mikasa();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_miku = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .miku();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_minato = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .minato();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_naruto = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .naruto();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_natsukawa = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .natsukawa();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_neko = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .neko();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_nekonime = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .nekonime();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_nezuko = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .nezuko();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_nishimiya = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .nishimiya();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_onepiece = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .onepiece();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_pokemon = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .pokemon();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_rem = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .rem();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_rize = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .rize();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_sagiri = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .sagiri();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_sakura = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .sakura();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_sasuke = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .sasuke();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_shina = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .shina();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_shinka = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .shinka();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_shizuka = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .shizuka();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_shota = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .shota();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_simp = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .simp();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_tomori = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .tomori();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_toukachan = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .toukachan();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_tsunade = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .tsunade();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_yatogami = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .yatogami();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_sfw_yuki = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        try {
          const data = nekellScraper.random_image.anime_sfw
            .yuki();
          res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

// NSFW
exports.random_image_anime_nsfw_ahegao = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .ahegao();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_ass = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .ass();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_bdsm = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .bdsm();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_blowjob = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .blowjob();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_cuckold = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .cuckold();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_cum = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .cum();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_eba = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .eba();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_ero = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .ero();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_femdom = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .femdom();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_foot = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .foot();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_gangbang = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .gangbang();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_gifs = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .gifs();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_glasses = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .glasses();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_hentai = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .hentai();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_jahy = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .jahy();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_manga = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .manga();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_masturbation = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .masturbation();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_megumin = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .megumin();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_neko = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .neko();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_nekonime = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .nekonime();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_loli = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .loli();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_orgy = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .orgy();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_panties = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .panties();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_pussy = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .pussy();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_tentacles = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .tentacles();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_thighs = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .thighs();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_yuri = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .yuri();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.random_image_anime_nsfw_zettai = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        return res.status(403).json({
          status: "Failed",
          code: 403,
          message: "You do not have permission to access this feature. This feature is only available to Premium and Enterprise users"
        });
      } else {

        db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }

          if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
            if (user.usage_limit <= 0) {
              return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
            }

            db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });
          }

          try {
            const data = nekellScraper.random_image.anime_nsfw
              .zettai();
            res.status(200).send(`<body bgcolor="black" style="height: 100vh; display: flex; justify-content: center; align-items: center;"><img src="${data}" width="100%" alt="Anime"></body>`);
          } catch (err) {
            console.error(err);
          }
        });
      }
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

// Check nickname
exports.check_nickname_game_free_fire = (req, res) => {
  const {
    user_id,
    api_key
  } = req.query;

  if (!user_id || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "User Id or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      wibusoftScraper.game.nickNameFreefire(user_id)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                user_id: user_id,
                nickname: data.userName
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });

    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.check_nickname_game_mobile_legends = (req, res) => {
  const {
    user_id,
    user_zone_id,
    api_key
  } = req.query;

  if (!user_id || !user_zone_id || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "User Id, User zone Id or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      wibusoft.game.nickNameMobileLegends(user_id, user_zone_id)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                user_id: user_id,
                user_zone_id: user_zone_id,
                nickname: data.userName
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });

    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.check_nickname_game_super_sus = (req, res) => {
  const {
    user_id,
    api_key
  } = req.query;

  if (!user_id || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "User Id or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      wibusoft.game.superSusChecker(user_id)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                user_id: user_id,
                nickname: data.name
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });

    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

// URL shortener
exports.url_shortener_bitly = (req, res) => {
  const {
    target_url,
    api_key
  } = req.query;

  if (!target_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      const randomBitlyAccessToken = secret_key.bitly[Math.floor(Math.random() * secret_key.bitly.length)];
      const bitlyAPI = new BitlyClient(randomBitlyAccessToken);

      bitlyAPI.shorten(target_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                original_url: target_url,
                url_shortener: data.link
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });

    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.url_shortener_cuttly = (req, res) => {
  const {
    target_url,
    api_key
  } = req.query;

  if (!target_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      const randomCuttlyAccessToken = secret_key.cuttly[Math.floor(Math.random() * secret_key.cuttly.length)];

      const cuttlyAPI = (target_url) => {
        return fetch(`https://cutt.ly/api/api.php?key=${randomCuttlyAccessToken}&short=${target_url}`);
      };

      cuttlyAPI(target_url)
        .then(response => response.json())
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                original_url: target_url,
                url_shortener: data.url.shortLink
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });

    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.url_shortener_tinyurl = (req, res) => {
  const {
    target_url,
    api_key
  } = req.query;

  if (!target_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      TinyURL.shorten(target_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                original_url: target_url,
                url_shortener: data
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });

    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.url_shortener_tinyurl_with_alias = (req, res) => {
  const {
    target_url,
    alias,
    api_key
  } = req.query;

  if (!target_url || !alias || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL, Alias or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      const data = {
        'url': target_url,
        'alias': alias
      }

      TinyURL.shortenWithAlias(data)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                original_url: target_url,
                url_shortener: data
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });

    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.url_shortener_tinyurl_resolve = (req, res) => {
  const {
    target_url,
    api_key
  } = req.query;

  if (!target_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      TinyURL.resolve(target_url)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                url_shortener: target_url,
                original_url: data
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });

    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

// Converter
exports.converter_text_to_image = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.converter.text_to_image(text)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.converter_text_to_gif = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.converter.text_to_gif(text)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            const buffer = Buffer.from(data);
            res.set('Content-Type', 'image/png');
            res.send(buffer);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.converter_text_to_speech = (req, res) => {
  const {
    text,
    language,
    api_key
  } = req.query;

  if (!text || !language || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text, Language or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      soundoftext.sounds.create({
          text: text,
          voice: language
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: {
                text: text,
                language: language,
                audio_url: data
              }
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};


// Tools
exports.tools_translate = (req, res) => {
  const {
    text,
    language,
    api_key
  } = req.query;

  if (!text || !language || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text, Language or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }
      });

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        if (user.usage_limit <= 0) {
          return res.status(429).json({
            status: "Failed",
            code: 429,
            message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
          });
        }

        db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }
        });
      }

      fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + language + '&dt=t&q=' + text)
        .then(response => response.json())
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Fetch failed"
            });
          };

          const translatedText = data[0][0][0];

          return res.status(200).json({
            status: "Success",
            code: 200,
            author: web_set.author,
            data: {
              original_text: text,
              language: language,
              translated_text: translatedText
            }
          });
        });

    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.tools_get_temp_mail = (req, res) => {
  const {
    api_key
  } = req.query;

  if (!api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.tools.get_temp_mail()
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.tools_get_temp_mail_inbox = (req, res) => {
  const {
    id,
    api_key
  } = req.query;

  if (!id || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "ID or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.tools.get_temp_mail_inbox(id)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.json();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data.data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.tools_screenshot_website = (req, res) => {
  const {
    target_url,
    device,
    api_key
  } = req.query;

  if (!target_url || !device || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL, Device or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }

        if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
          if (user.usage_limit <= 0) {
            return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
          }

          db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                status: "Failed",
                code: 500,
                message: "An error occurred"
              });
            }
          });
        }

        nekellScraper.tools.screenshot_website(target_url, device).then((data) => {
            res.set({
              'Content-Type': 'image/png'
            })
            res.send(data)
          })
          .catch((err) => {
            console.error(err);
          });

      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.tools_style_text = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      nekellScraper.tools.style_text(text)
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: data
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.tools_fetch = (req, res) => {
  const {
    target_url,
    api_key
  } = req.query;

  if (!target_url || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Target URL or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      fetch(target_url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Request failed!");
          }
          return response.text();
        })
        .then(data => {
          if (!data) {
            return res.status(404).json({
              status: "Failed",
              code: 404,
              message: "Data not found!"
            });
          } else {
            db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({
                  status: "Failed",
                  code: 500,
                  message: "An error occurred"
                });
              }
            });

            if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
              if (user.usage_limit <= 0) {
                return res.status(429).json({
                  status: "Failed",
                  code: 429,
                  message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
                });
              }

              db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    status: "Failed",
                    code: 500,
                    message: "An error occurred"
                  });
                }
              });
            }

            const formattedData = data.replace(/(\r\n|\n|\r)/g, '\n');

            return res.status(200).json({
              status: "Success",
              code: 200,
              author: web_set.author,
              data: formattedData
            });
          }
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.tools_base32_encode = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }
      });

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        if (user.usage_limit <= 0) {
          return res.status(429).json({
            status: "Failed",
            code: 429,
            message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
          });
        }

        db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }
        });
      }

      const encodedText = nekellScraper.tools.base32_encode(text);

      return res.status(200).json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          type: "base32",
          original_text: text,
          encoded_text: encodedText
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.tools_base32_decode = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "Error. An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "Error. An error occurred"
          });
        }
      });

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        if (user.usage_limit <= 0) {
          return res.status(429).json({
            status: "Failed",
            code: 429,
            message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
          });
        }

        db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }
        });
      }

      const decodedText = nekellScraper.tools.base32_decode(text);

      return res.status(200).json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          type: "base32",
          original_text: text,
          decoded_text: decodedText
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.tools_base64_encode = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }
      });

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        if (user.usage_limit <= 0) {
          return res.status(429).json({
            status: "Failed",
            code: 429,
            message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
          });
        }

        db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }
        });
      }

      const encodedText = nekellScraper.tools.base64_encode(text);

      return res.status(200).json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          type: "base64",
          original_text: text,
          encoded_text: encodedText
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};

exports.tools_base64_decode = (req, res) => {
  const {
    text,
    api_key
  } = req.query;

  if (!text || !api_key) {
    return res.status(400).json({
      status: "Failed",
      code: 400,
      message: "Text or API key parameters not found!"
    });
  }

  const currentTime = new Date();

  db.query('SELECT * FROM users WHERE api_key = ?', [api_key], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: "Failed",
        code: 500,
        message: "An error occurred"
      });
    }

    if (result.length > 0) {
      const user = result[0];

      db.query('INSERT INTO request_logs (api_key, date, daily_requests, total_requests) VALUES (?, ?, 1, 1) ON DUPLICATE KEY UPDATE daily_requests = daily_requests + 1, total_requests = total_requests + 1', [api_key, currentTime], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "Failed",
            code: 500,
            message: "An error occurred"
          });
        }
      });

      if (user.account_type !== "Premium" && user.account_type !== "Enterprise") {
        if (user.usage_limit <= 0) {
          return res.status(429).json({
            status: "Failed",
            code: 429,
            message: "Your daily limit has been exhausted, the limit will be reset every 00:00 WIB"
          });
        }

        db.query('UPDATE users SET usage_limit = usage_limit - 1 WHERE api_key = ?', [api_key], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: "Failed",
              code: 500,
              message: "An error occurred"
            });
          }
        });
      }

      const decodedText = nekellScraper.tools.base64_decode(text);

      return res.status(200).json({
        status: "Success",
        code: 200,
        author: web_set.author,
        data: {
          type: "base64",
          original_text: text,
          decoded_text: decodedText
        }
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        code: 404,
        message: `API key: ${api_key}, not found. If you don't have an API key, please register and get the key in the dashboard.`
      });
    }
  });
};