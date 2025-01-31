const config = require('../../config.json');

module.exports = class guntherUtils {
    get _24H_COMMAND_ENABLED() {
        return (process.env._24H_COMMAND_ENABLED ? process.env._24H_COMMAND_ENABLED : config._24H_COMMAND_ENABLED) || false
    }
    
    get ONLY_OWNERS_CAN_INVITE() {
        return (process.env.ONLY_OWNERS_CAN_INVITE ? process.env.ONLY_OWNERS_CAN_INVITE : config.ONLY_OWNERS_CAN_INVITE) || false
    }
    
    get AUTO_SET_BOTINFO_ONSTART() {
        return (process.env.AUTO_SET_BOTINFO_ONSTART ? process.env.AUTO_SET_BOTINFO_ONSTART : config.AUTO_SET_BOTINFO_ONSTART) || false
    }

    get AUTO_RESUME_ENABLED() {
        return (process.env.AUTO_RESUME_ENABLED ? process.env.AUTO_RESUME_ENABLED : config.AUTO_RESUME_ENABLED) || false
    }

    get DEBUG_SERVER() {
        return (process.env.DEBUG_SERVER ? process.env.DEBUG_SERVER : config.DEBUG_SERVER) || false
    }

    get VALID_SERVERS() {
        let valid = (process.env.VALID_SERVERS ? process.env.VALID_SERVERS.split(',').length ? process.env.VALID_SERVERS.split(',') : config.VALID_SERVERS : config.VALID_SERVERS) || []
        valid = Array.isArray(valid) ? valid : [];
        let debug = process.env.DEBUG_SERVER ? process.env.DEBUG_SERVER : config.DEBUG_SERVER
        if (debug && valid.length) {valid.push(debug); valid = [...new Set(valid)];}
        return valid || [];
    }
    
    get IP_ADDR() {
        const explicitIp = process.env.PUBLIC_IPADDR ? process.env.PUBLIC_IPADDR : config.PUBLIC_IPADDR;

        if (!explicitIp) {
            const { networkInterfaces } = require('os');

            const nets = networkInterfaces();
            const results = Object.create(null);

            for (const name of Object.keys(nets)) {
                for (const net of nets[name]) {
                    const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                    if (net.family === familyV4Value && !net.internal) {
                        if (!results[name]) {
                            results[name] = [];
                        }
                        results[name].push(net.address);
                    }
                }
            }

            return results[process.env.NETWORK_DEV || config.NETWORK_DEV][process.env.NETWORK_DEV_INDEX || config.NETWORK_DEV_INDEX || 0]
        }

        return explicitIp;
    }

    EMBED_COLOR(minshade) {
        try {
            const mdColors = { Amber: { 50: '#fff8e1', 100: '#ffecb3', 200: '#ffe082', 300: '#ffd54f', 400: '#ffca28', 500: '#ffc107', 600: '#ffb300', 700: '#ffa000', 800: '#ff8f00', 900: '#ff6f00', }, 'Blue Grey': { 50: '#ECEFF1', 100: '#CFD8DC', 200: '#B0BEC5', 300: '#90A4AE', 400: '#78909C', 500: '#607D8B', 600: '#546E7A', 700: '#455A64', 800: '#37474F', 900: '#263238', }, Blue: { 50: '#E3F2FD', 100: '#BBDEFB', 200: '#90CAF9', 300: '#64B5F6', 400: '#42A5F5', 500: '#2196F3', 600: '#1E88E5', 700: '#1976D2', 800: '#1565C0', 900: '#0D47A1', }, Brown: { 50: '#EFEBE9', 100: '#D7CCC8', 200: '#BCAAA4', 300: '#A1887F', 400: '#8D6E63', 500: '#795548', 600: '#6D4C41', 700: '#5D4037', 800: '#4E342E', 900: '#3E2723', }, Cyan: { 50: '#E0F7FA', 100: '#B2EBF2', 200: '#80DEEA', 300: '#4DD0E1', 400: '#26C6DA', 500: '#00BCD4', 600: '#00ACC1', 700: '#0097A7', 800: '#00838F', 900: '#006064', }, 'Deep Orange': { 50: '#FBE9E7', 100: '#FFCCBC', 200: '#FFAB91', 300: '#FF8A65', 400: '#FF7043', 500: '#FF5722', 600: '#F4511E', 700: '#E64A19', 800: '#D84315', 900: '#BF360C', }, 'Deep Purple': { 50: '#EDE7F6', 100: '#D1C4E9', 200: '#B39DDB', 300: '#9575CD', 400: '#7E57C2', 500: '#673AB7', 600: '#5E35B1', 700: '#512DA8', 800: '#4527A0', 900: '#311B92', }, Green: { 50: '#E8F5E9', 100: '#C8E6C9', 200: '#A5D6A7', 300: '#81C784', 400: '#66BB6A', 500: '#4CAF50', 600: '#43A047', 700: '#388E3C', 800: '#2E7D32', 900: '#1B5E20', }, Grey: { 50: '#FAFAFA', 100: '#F5F5F5', 200: '#EEEEEE', 300: '#E0E0E0', 400: '#BDBDBD', 500: '#9E9E9E', 600: '#757575', 700: '#616161', 800: '#424242', 900: '#212121', }, Indigo: { 50: '#E8EAF6', 100: '#C5CAE9', 200: '#9FA8DA', 300: '#7986CB', 400: '#5C6BC0', 500: '#3F51B5', 600: '#3949AB', 700: '#303F9F', 800: '#283593', 900: '#1A237E', }, 'Light Blue': { 50: '#E1F5FE', 100: '#B3E5FC', 200: '#81D4FA', 300: '#4FC3F7', 400: '#29B6F6', 500: '#03A9F4', 600: '#039BE5', 700: '#0288D1', 800: '#0277BD', 900: '#01579B', }, 'Light Green': { 50: '#F1F8E9', 100: '#DCEDC8', 200: '#C5E1A5', 300: '#AED581', 400: '#9CCC65', 500: '#8BC34A', 600: '#7CB342', 700: '#689F38', 800: '#558B2F', 900: '#33691E', }, Lime: { 50: '#F9FBE7', 100: '#F0F4C3', 200: '#E6EE9C', 300: '#DCE775', 400: '#D4E157', 500: '#CDDC39', 600: '#C0CA33', 700: '#AFB42B', 800: '#9E9D24', 900: '#827717', }, Orange: { 50: '#FFF3E0', 100: '#FFE0B2', 200: '#FFCC80', 300: '#FFB74D', 400: '#FFA726', 500: '#FF9800', 600: '#FB8C00', 700: '#F57C00', 800: '#EF6C00', 900: '#E65100', }, Pink: { 50: '#FCE4EC', 100: '#F8BBD0', 200: '#F48FB1', 300: '#F06292', 400: '#EC407A', 500: '#E91E63', 600: '#D81B60', 700: '#C2185B', 800: '#AD1457', 900: '#880E4F', }, Purple: { 50: '#F3E5F5', 100: '#E1BEE7', 200: '#CE93D8', 300: '#BA68C8', 400: '#AB47BC', 500: '#9C27B0', 600: '#8E24AA', 700: '#7B1FA2', 800: '#6A1B9A', 900: '#4A148C', }, Red: { 50: '#FFEBEE', 100: '#FFCDD2', 200: '#EF9A9A', 300: '#E57373', 400: '#EF5350', 500: '#F44336', 600: '#E53935', 700: '#D32F2F', 800: '#C62828', 900: '#B71C1C', }, Teal: { 50: '#E0F2F1', 100: '#B2DFDB', 200: '#80CBC4', 300: '#4DB6AC', 400: '#26A69A', 500: '#009688', 600: '#00897B', 700: '#00796B', 800: '#00695C', 900: '#004D40', }, Yellow: { 50: '#FFFDE7', 100: '#FFF9C4', 200: '#FFF59D', 300: '#FFF176', 400: '#FFEE58', 500: '#FFEB3B', 600: '#FDD835', 700: '#FBC02D', 800: '#F9A825', 900: '#F57F17', } };
            
            minshade = minshade || 300;
            minshade = (minshade < 50 ? 50 : (minshade > 900 ? 900 : minshade));
            minshade = (minshade < 100 ? Math.round(minshade/10)*10 : Math.round(minshade/100)*100);
        
            const colors = Object.keys(mdColors);
            const mainColor = mdColors[colors[colors.length * Math.random() << 0]];
            let colorCandidates = [];
            Object.keys(mainColor).map(function(key, index) {
                if (parseInt(key) >= minshade) colorCandidates.push(mainColor[key]);
            });
            return colorCandidates[Math.floor(Math.random()*colorCandidates.length)].toUpperCase();
        } catch {
            return "RANDOM";
        }
    }

    HEX_TO_RGBTUPLE(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    GENERATE_ICON(EMBED_COLOR, req, res) {
        const fs = require('fs'); const iconpath = process.cwd()+"/src/assets/img/icons/"+req.params.name;
        try {
            if (fs.existsSync(iconpath)) {
                let materialColor = req.query.color || EMBED_COLOR(300);
                materialColor.replace("#", ""); materialColor = "#"+materialColor;
                if (!(/^#([0-9A-F]{3}){1,2}$/i.test(materialColor))) materialColor = EMBED_COLOR(300);
    
                let format, sharp;
                if (req.params.name == "vinyl.gif") {
                    res.sendFile(process.cwd()+"/src/assets/img/icons/vinyl.gif");
                    /*format = "gif";
                    sharp = require('sharp')(iconpath, { animated: true });
                    sharp.tint(materialColor);*/
                } else {
                    format = "png";
                    sharp = require('sharp')(iconpath);
                    sharp.extend({
                        top: 20, bottom: 20, left: 20, right: 20,
                        background: materialColor
                    })
                    .flatten({ background: materialColor }).toBuffer().then(iconBuffer => {
                        res.writeHead(200, {
                            'Content-Type': 'image/'+format,
                            'Content-Length': iconBuffer.length
                        });
                        res.end(iconBuffer);
                    }).catch(error => {
                        res.writeHead(500);
                        res.end();
                        console.log(error);
                    });
                }
            } else {
                res.writeHead(404);
                res.end();
            }
        } catch(error) {
            res.writeHead(500);
            res.end();
            console.log(error);
        }
    }
}