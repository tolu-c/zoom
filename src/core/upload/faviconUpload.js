import bodyParser from 'body-parser';
import { faviconUploadDir } from '../../config';
import multer from 'multer';
const crypto = require('crypto');
const fs = require('fs')
import sharp from 'sharp'
const uploadDir = '.' + faviconUploadDir;
const faviconUpload = app => {
    var storage = multer.diskStorage({
        destination: uploadDir,
        filename: function (req, file, cb) {
            crypto.pseudoRandomBytes(16, function (err, raw) {console.log('errerr',err)
                if (err) return cb(err);

                let ext;

                switch (file.mimetype) {
                    case 'image/jpeg':
                        ext = '.jpeg';
                        break;
                    case 'image/png':
                        ext = '.png';
                        break;
                    case 'image/jpg':
                        ext = '.jpg';
                        break;
                }
                cb(null, raw.toString('hex') + ext);
            })
        }
    })

    var upload = multer({ storage: storage });
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    let data = [
        {
            filename: 'android-icon-36x36.png',
            size: 36
        },
        {
            filename: 'android-icon-48x48.png',
            size: 48
        },
        {
            filename: 'android-icon-72x72.png',
            size: 72
        },
        {
            filename: 'android-icon-96x96.png',
            size: 96
        },
        {
            filename: 'android-icon-144x144.png',
            size: 144
        },
        {
            filename: 'android-icon-192x192.png',
            size: 192
        },
        {
            filename: 'apple-icon.png',
            size: 192
        },
        {
            filename: 'apple-icon-57x57.png',
            size: 57
        },
        {
            filename: 'apple-icon-60x60.png',
            size: 60
        },
        {
            filename: 'apple-icon-72x72.png',
            size: 72
        },
        {
            filename: 'apple-icon-76x76.png',
            size: 76
        },
        {
            filename: 'apple-icon-114x114.png',
            size: 114
        },
        {
            filename: 'apple-icon-120x120.png',
            size: 120
        },
        {
            filename: 'apple-icon-144x144.png',
            size: 144
        },
        {
            filename: 'apple-icon-152x152.png',
            size: 152
        },
        {
            filename: 'apple-icon-180x180.png',
            size: 180
        },
        {
            filename: 'apple-icon-192x192.png',
            size: 192
        },
        {
            filename: 'favicon.ico',
            size: 24
        },
        {
            filename: 'favicon-16x16.png',
            size: 16
        },
        {
            filename: 'favicon-32x32.png',
            size: 32
        },
        {
            filename: 'favicon-96x96.png',
            size: 96
        },
        {
            filename: 'ms-icon-70x70.png',
            size: 70
        },
        {
            filename: 'ms-icon-144x144.png',
            size: 144
        },
        {
            filename: 'ms-icon-150x150.png',
            size: 150
        },
        {
            filename: 'ms-icon-310x310.png',
            size: 310
        },
        {
            filename: 'apple-touch-icon.png',
            size: 180
        }
    ];

    async function removeFiles(fileName, filePath) {
        if (fs.existsSync(filePath + fileName)) {
            fs.unlink(filePath + fileName, (err) => {
                if (err) console.log(err)
            })
        }
    }
    
    app.post('/deleteFavicon', function (req, res, next) {
        next()
    }, async (req, res, next) => {
        const fileName = req.body.fileName;
        const filePath = uploadDir;

        await removeFiles(fileName, filePath)
        res.send({
            status: 200
        })
    })

    app.post('/uploadFavicon', function (req, res, next) {
        next();
    }, upload.array('file'), async (req, res, next) => {
        let files = req.files;
        let type = req.body.type;
        let status = 200, errorMessage, fileName;
        try {
            fileName = files[0].filename;
            status = 200;

            await sharp(files[0].path).toFile(uploadDir+ 'favicon.png', function (err) {
                console.log(err)
            });

            await Promise.all([
                data.map(async (o) => {
                    sharp(files[0].path)
                        .resize(o.size, o.size)
                        .toFile(uploadDir+ o.filename, function (err) {
                            console.log({ err })
                        })
                })
            ]);
            
            res.send({ status, errorMessage, fileName })
        } catch (error) {
            status = 400;
            errorMessage = 'Somthing went wrong' + error;
            res.send({ status, errorMessage })
        }
    }
    )

    
}

export default faviconUpload;