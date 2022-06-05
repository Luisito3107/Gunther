### Thumbnails folder

This is where the server will store the album covers of the local audio attachments (with the `/play file` and `/forceplay file` slash commands).

The server will store a compressed 640x640 .jpg picture, and will keep that file available for 12 hours (the server will search for and delete any .jpg file older than 12 hours within this folder, each hour).

Therefore, this folder will be empty by default. Git doesn't upload empty folders, hence this readme file. However, if this folder doesn't exist and a user tries to play a local file, the server will create it.