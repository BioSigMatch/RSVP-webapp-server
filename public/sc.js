// グローバル変数
let targetImages = [];
let nontargetImages = [];
const otherImages = ['./otherimage/stable.png', './otherimage/trigger.png', './otherimage/nontrigger.png', './otherimage/black.png'];

// 画像表示の設定
let frameRate = 3; // 3Hz
let frameDuration = 1000 / frameRate; // フレーム間隔(ミリ秒)
let tshowNum = 1;
let ntshowNum = 1;

let imageList = [];
let selecttargetImages = [];
let selectnontargetImages = [];

let targetLen = 0;
let nontargetLen = 0;

let imageOrder = [];
let stable_t = 1000;
let isShuffle;

async function fetchImageList(type) {
    try {
        const response = await fetch(`/api/images?type=${type}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching image list:', error);
        return [];
    }
}

function preloadImages(images) {
    images.forEach(image => {
        const img = new Image();
        img.src = image.url;
    });
}

function openFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
    }
}

function generateNonConsecutiveArray(nontargetLen, targetLen) {
    let Order = [];
    if (isShuffle) {
        if (targetLen > nontargetLen) {
            console.log("nontargetLen is more than targetLen");
            return;
        }

        for (let i = 0; i < targetLen * 2 - 1; i++) {
            if (i % 2 === 0) {
                Order.push(1);
            } else {
                Order.push(0);
            }
        }
        console.log("order1:", Order);

        let max = Order.length;
        let min = 0;
        for (let i = 0; i < nontargetLen - targetLen + 1; i++) {
            let randomIndex = Math.floor(Math.random() * (max - min) + min);
            Order.splice(randomIndex, 0, 0);
        }
    } else {
        for (let i = 0; i < targetLen; i++) {
            Order.push(1);
        }
        for (let i = 0; i < nontargetLen; i++) {
            Order.push(0);
        }
        shuffleArray(Order);
    }
    console.log("order2:", Order);

    return Order;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function initializeImages() {
    try {
        targetImages = await fetchImageList('target');
        nontargetImages = await fetchImageList('nontarget');

        preloadImages(targetImages);
        preloadImages(nontargetImages);

        document.getElementById('targetCount').textContent = `ターゲット画像: ${targetImages.length} 枚`;
        document.getElementById('nontargetCount').textContent = `ノンターゲット画像: ${nontargetImages.length} 枚`;

        console.log('Images initialized successfully');
    } catch (error) {
        console.error('Error initializing images:', error);
        alert('画像の読み込みに失敗しました。ページをリロードしてください。');
    }
}

function displayImages() {
    openFullscreen(); 
    let imageIndex = 0;
    let t_index = 0;
    let nt_index = 0;
    let imageSrc;

    stable();
    trigger();
    //  安静時トリガを表示
    setTimeout(nontrigger, stable_t);

    function showNextImage() {
        if (imageIndex >= imageOrder.length) {
            // 全ての画像を表示し終えた場合は終了
            main_iamge(otherImages[3]);
            setTimeout(saveData, 1000);
            return;
        }

        const isTarget = imageOrder[imageIndex] === 1;
        if (isTarget) {
            imageSrc = selecttargetImages[t_index];
            t_index++;
        } else {
            imageSrc = selectnontargetImages[nt_index];
            nt_index++;
        }

        main_iamge(imageSrc.url);
        trigger();
        setTimeout(nontrigger, frameDuration / 2);
        imageIndex++;

        imageList.push(imageSrc.name);
        setTimeout(showNextImage, frameDuration);
    }

    setTimeout(showNextImage, stable_t + 1000);

    //最後の画像が表示された後，トリガを消す
    setTimeout(nontrigger, frameDuration / 2);
}

function main_iamge(imsrc) {
    const imageDisplay = document.getElementById('imageDisplay');
    imageDisplay.src = imsrc;
}

function trigger() {
    const overlayImage = document.getElementById('overlayImage');
    overlayImage.src = otherImages[1];
}

function nontrigger() {
    const overlayImage = document.getElementById('overlayImage');
    overlayImage.src = otherImages[2];
}

function stable() {
    const imageDisplay = document.getElementById('imageDisplay');
    imageDisplay.src = otherImages[0];
}

function saveData() {
    document.exitFullscreen();
    document.getElementById('imageDisplay').style.display = 'none';
    document.getElementById('csvSave').style.display = 'block';

    document.getElementById('csvSave').addEventListener('click', function() {
        let data = "";
        for (let i = 0; i < imageOrder.length; i++) {
            data += imageOrder[i] + "," + imageList[i] + "\r";
        }

        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const blob = new Blob([bom, data], { type: "text/csv" });
        const objectUrl = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        const fileName = "event_id.csv";
        downloadLink.download = fileName;
        downloadLink.href = objectUrl;

        downloadLink.click();
        downloadLink.remove();
    });
}

window.addEventListener('load', async function() {
    document.getElementById('csvSave').style.display = 'none';
    document.getElementById('button2').style.display = 'none';

    await initializeImages();

    document.getElementById('button1').addEventListener('click', function() {
        document.body.requestFullscreen().then(() => {
            // UIの非表示処理
            document.getElementById('button1').style.display = 'none';
            document.getElementById('targetInput').style.display = 'none';
            document.getElementById('nontargetInput').style.display = 'none';
            document.getElementById('targetCount').style.display = 'none';
            document.getElementById('nontargetCount').style.display = 'none';
            document.querySelector('.container').style.display = 'none';
            document.querySelector('.value_container').style.display = 'none';
            document.querySelector('.check_container').style.display = 'none';
            document.querySelector('.title').style.display = 'none';

            document.getElementById('button2').style.display = 'block';

            tshowNum = parseInt(document.getElementById('targetCount').value, 10) || 1;
            ntshowNum = parseInt(document.getElementById('nontargetCount').value, 10) || 1;
            stable_t = parseInt(document.getElementById('stable_time').value, 10) * 1000 || 1000;
            isShuffle = document.getElementById('isShuffle').checked;
            frameRate = parseInt(document.getElementById('freq').value, 10) || 3;
            frameDuration = 1000 / frameRate;

            console.log(isShuffle);

            selecttargetImages = targetImages//.slice(0, Math.min(targetImages.length, tshowNum));
            selectnontargetImages = nontargetImages//.slice(0, Math.min(nontargetImages.length, ntshowNum));

            targetLen = selecttargetImages.length;
            nontargetLen = selectnontargetImages.length;
            imageOrder = generateNonConsecutiveArray(nontargetLen, targetLen);
            console.log('Shuffled Array:', imageOrder);

            console.log('select targetArray:', selecttargetImages);    
            console.log('select nontargetArray:', selectnontargetImages);

            shuffleArray(selecttargetImages);
            shuffleArray(selectnontargetImages);
        });
    });

    document.getElementById('button2').addEventListener('click', function() {
        document.getElementById('button2').style.display = 'none';
        requestAnimationFrame(displayImages);
    });
});