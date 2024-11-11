var w = (c.width = window.innerWidth),
    h = (c.height = window.innerHeight),
    ctx = c.getContext('2d'),
    hw = w / 2,
    hh = h / 3,
    opts = {
        strings: ['HAPPY', 'BIRTHDAY', 'HẢI VY'],
        charSize: 70,
        charSpacing: 70,
        lineHeight: 140,

        cx: w / 2,
        cy: h / 2,

        fireworkPrevPoints: 10,
        fireworkBaseLineWidth: 5,
        fireworkAddedLineWidth: 8,
        fireworkSpawnTime: 200,
        fireworkBaseReachTime: 40,
        fireworkAddedReachTime: 40,
        fireworkCircleBaseSize: 40,
        fireworkCircleAddedSize: 10,
        fireworkCircleBaseTime: 30,
        fireworkCircleAddedTime: 30,
        fireworkCircleFadeBaseTime: 10,
        fireworkCircleFadeAddedTime: 5,
        fireworkBaseShards: 5,
        fireworkAddedShards: 5,
        fireworkShardPrevPoints: 3,
        fireworkShardBaseVel: 4,
        fireworkShardAddedVel: 2,
        fireworkShardBaseSize: 3,
        fireworkShardAddedSize: 3,
        gravity: 0.1,
        upFlow: -0.1,
        letterContemplatingWaitTime: 360,
        balloonSpawnTime: 20,
        balloonBaseInflateTime: 10,
        balloonAddedInflateTime: 10,
        balloonBaseSize: 20,
        balloonAddedSize: 20,
        balloonBaseVel: 0.4,
        balloonAddedVel: 0.4,
        balloonBaseRadian: -(Math.PI / 2 - 0.5),
        balloonAddedRadian: -1,
    },
    calc = {
        totalWidth:
            opts.charSpacing *
            Math.max(opts.strings[0].length, opts.strings[1].length),
    },
    Tau = Math.PI * 2,
    TauQuarter = Tau / 4,
    letters = [];

ctx.font = opts.charSize + 'px Verdana';

function Letter(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;

    this.dx = -ctx.measureText(char).width / 2;
    this.dy = +opts.charSize / 2;

    this.fireworkDy = this.y - hh;

    var hue = (x / calc.totalWidth) * 360;

    this.color = 'hsl(hue,80%,50%)'.replace('hue', hue);
    this.lightAlphaColor = 'hsla(hue,80%,light%,alp)'.replace('hue', hue);
    this.lightColor = 'hsl(hue,80%,light%)'.replace('hue', hue);
    this.alphaColor = 'hsla(hue,80%,50%,alp)'.replace('hue', hue);

    this.reset();
}
Letter.prototype.reset = function () {
    this.phase = 'firework';
    this.tick = 0;
    this.spawned = false;
    this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
    this.reachTime =
        (opts.fireworkBaseReachTime +
            opts.fireworkAddedReachTime * Math.random()) |
        0;
    this.lineWidth =
        opts.fireworkBaseLineWidth +
        opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints = [[0, hh, 0]];
};
Letter.prototype.step = function () {
    if (this.phase === 'firework') {
        if (!this.spawned) {
            ++this.tick;
            if (this.tick >= this.spawningTime) {
                this.tick = 0;
                this.spawned = true;
            }
        } else {
            ++this.tick;

            var linearProportion = this.tick / this.reachTime,
                armonicProportion = Math.sin(linearProportion * TauQuarter),
                x = linearProportion * this.x,
                y = hh + armonicProportion * this.fireworkDy;

            if (this.prevPoints.length > opts.fireworkPrevPoints)
                this.prevPoints.shift();

            this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

            var lineWidthProportion = 1 / (this.prevPoints.length - 1);

            for (var i = 1; i < this.prevPoints.length; ++i) {
                var point = this.prevPoints[i],
                    point2 = this.prevPoints[i - 1];

                ctx.strokeStyle = this.alphaColor.replace(
                    'alp',
                    i / this.prevPoints.length
                );
                ctx.lineWidth = point[2] * lineWidthProportion * i;
                ctx.beginPath();
                ctx.moveTo(point[0], point[1]);
                ctx.lineTo(point2[0], point2[1]);
                ctx.stroke();
            }

            if (this.tick >= this.reachTime) {
                this.phase = 'contemplate';

                this.circleFinalSize =
                    opts.fireworkCircleBaseSize +
                    opts.fireworkCircleAddedSize * Math.random();
                this.circleCompleteTime =
                    (opts.fireworkCircleBaseTime +
                        opts.fireworkCircleAddedTime * Math.random()) |
                    0;
                this.circleCreating = true;
                this.circleFading = false;

                this.circleFadeTime =
                    (opts.fireworkCircleFadeBaseTime +
                        opts.fireworkCircleFadeAddedTime * Math.random()) |
                    0;
                this.tick = 0;
                this.tick2 = 0;

                this.shards = [];

                var shardCount =
                        (opts.fireworkBaseShards +
                            opts.fireworkAddedShards * Math.random()) |
                        0,
                    angle = Tau / shardCount,
                    cos = Math.cos(angle),
                    sin = Math.sin(angle),
                    x = 1,
                    y = 0;

                for (var i = 0; i < shardCount; ++i) {
                    var x1 = x;
                    x = x * cos - y * sin;
                    y = y * cos + x1 * sin;

                    this.shards.push(
                        new Shard(this.x, this.y, x, y, this.alphaColor)
                    );
                }
            }
        }
    } else if (this.phase === 'contemplate') {
        ++this.tick;

        if (this.circleCreating) {
            ++this.tick2;
            var proportion = this.tick2 / this.circleCompleteTime,
                armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

            ctx.beginPath();
            ctx.fillStyle = this.lightAlphaColor
                .replace('light', 50 + 50 * proportion)
                .replace('alp', proportion);
            ctx.beginPath();
            ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
            ctx.fill();

            if (this.tick2 > this.circleCompleteTime) {
                this.tick2 = 0;
                this.circleCreating = false;
                this.circleFading = true;
            }
        } else if (this.circleFading) {
            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

            ++this.tick2;
            var proportion = this.tick2 / this.circleFadeTime,
                armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

            ctx.beginPath();
            ctx.fillStyle = this.lightAlphaColor
                .replace('light', 100)
                .replace('alp', 1 - armonic);
            ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
            ctx.fill();

            if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
        } else {
            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
        }

        for (var i = 0; i < this.shards.length; ++i) {
            this.shards[i].step();

            if (!this.shards[i].alive) {
                this.shards.splice(i, 1);
                --i;
            }
        }
    }
};
function Shard(x, y, vx, vy, color) {
    var vel =
        opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();

    this.vx = vx * vel;
    this.vy = vy * vel;

    this.x = x;
    this.y = y;

    this.prevPoints = [[x, y]];
    this.color = color;

    this.alive = true;

    this.size =
        opts.fireworkShardBaseSize +
        opts.fireworkShardAddedSize * Math.random();
}
Shard.prototype.step = function () {
    this.x += this.vx;
    this.y += this.vy += opts.gravity;

    if (this.prevPoints.length > opts.fireworkShardPrevPoints)
        this.prevPoints.shift();

    this.prevPoints.push([this.x, this.y]);

    var lineWidthProportion = this.size / this.prevPoints.length;

    for (var k = 0; k < this.prevPoints.length - 1; ++k) {
        var point = this.prevPoints[k],
            point2 = this.prevPoints[k + 1];

        ctx.strokeStyle = this.color.replace('alp', k / this.prevPoints.length);
        ctx.lineWidth = k * lineWidthProportion;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
    }

    if (this.prevPoints[0][1] > hh) this.alive = false;
};
function generateBalloonPath(x, y, size) {
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
        x - size / 2,
        y - size / 2,
        x - size / 4,
        y - size,
        x,
        y - size
    );
    ctx.bezierCurveTo(x + size / 4, y - size, x + size / 2, y - size / 2, x, y);
}

function anim() {
    window.requestAnimationFrame(anim);

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);

    ctx.translate(hw, hh);

    var done = true;
    for (var l = 0; l < letters.length; ++l) {
        letters[l].step();
        if (letters[l].phase !== 'done') done = false;
    }

    ctx.translate(-hw, -hh);

    if (done) for (var l = 0; l < letters.length; ++l) letters[l].reset();
}

for (var i = 0; i < opts.strings.length; ++i) {
    for (var j = 0; j < opts.strings[i].length; ++j) {
        letters.push(
            new Letter(
                opts.strings[i][j],
                j * opts.charSpacing +
                    opts.charSpacing / 2 -
                    (opts.strings[i].length * opts.charSize) / 2,
                i * opts.lineHeight +
                    opts.lineHeight / 2 -
                    (opts.strings.length * opts.lineHeight) / 2
            )
        );
    }
}

window.addEventListener('resize', function () {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;

    hw = w / 2;
    hh = h / 2;

    ctx.font = opts.charSize + 'px Verdana';
});

// confetti

var confetti = {
    maxCount: 150, //set max confetti count
    speed: 2, //set the particle animation speed
    frameInterval: 15, //the confetti animation frame interval in milliseconds
    alpha: 1.0, //the alpha opacity of the confetti (between 0 and 1, where 1 is opaque and 0 is invisible)
    gradient: false, //whether to use gradients for the confetti particles
    start: null, //call to start confetti animation (with optional timeout in milliseconds, and optional min and max random confetti count)
    stop: null, //call to stop adding confetti
    toggle: null, //call to start or stop the confetti animation depending on whether it's already running
    pause: null, //call to freeze confetti animation
    resume: null, //call to unfreeze confetti animation
    togglePause: null, //call to toggle whether the confetti animation is paused
    remove: null, //call to stop the confetti animation and remove all confetti immediately
    isPaused: null, //call and returns true or false depending on whether the confetti animation is paused
    isRunning: null, //call and returns true or false depending on whether the animation is running
};

(function () {
    confetti.start = startConfetti;
    confetti.stop = stopConfetti;
    confetti.toggle = toggleConfetti;
    confetti.pause = pauseConfetti;
    confetti.resume = resumeConfetti;
    confetti.togglePause = toggleConfettiPause;
    confetti.isPaused = isConfettiPaused;
    confetti.remove = removeConfetti;
    confetti.isRunning = isConfettiRunning;
    var supportsAnimationFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame;
    var colors = [
        'rgba(30,144,255,',
        'rgba(107,142,35,',
        'rgba(255,215,0,',
        'rgba(255,192,203,',
        'rgba(106,90,205,',
        'rgba(173,216,230,',
        'rgba(238,130,238,',
        'rgba(152,251,152,',
        'rgba(70,130,180,',
        'rgba(244,164,96,',
        'rgba(210,105,30,',
        'rgba(220,20,60,',
    ];
    var streamingConfetti = false;
    var animationTimer = null;
    var pause = false;
    var lastFrameTime = Date.now();
    var particles = [];
    var waveAngle = 0;
    var context = null;

    function resetParticle(particle, width, height) {
        particle.color =
            colors[(Math.random() * colors.length) | 0] +
            (confetti.alpha + ')');
        particle.color2 =
            colors[(Math.random() * colors.length) | 0] +
            (confetti.alpha + ')');
        particle.x = Math.random() * width;
        particle.y = Math.random() * height - height;
        particle.diameter = Math.random() * 10 + 5;
        particle.tilt = Math.random() * 10 - 10;
        particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
        particle.tiltAngle = Math.random() * Math.PI;
        return particle;
    }

    function toggleConfettiPause() {
        if (pause) resumeConfetti();
        else pauseConfetti();
    }

    function isConfettiPaused() {
        return pause;
    }

    function pauseConfetti() {
        pause = true;
    }

    function resumeConfetti() {
        pause = false;
        runAnimation();
    }

    function runAnimation() {
        if (pause) return;
        else if (particles.length === 0) {
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            animationTimer = null;
        } else {
            var now = Date.now();
            var delta = now - lastFrameTime;
            if (!supportsAnimationFrame || delta > confetti.frameInterval) {
                context.clearRect(0, 0, window.innerWidth, window.innerHeight);
                updateParticles();
                drawParticles(context);
                lastFrameTime = now - (delta % confetti.frameInterval);
            }
            animationTimer = requestAnimationFrame(runAnimation);
        }
    }

    function startConfetti(timeout, min, max) {
        var width = window.innerWidth;
        var height = window.innerHeight;
        window.requestAnimationFrame = (function () {
            return (
                window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    return window.setTimeout(callback, confetti.frameInterval);
                }
            );
        })();
        var canvas = document.getElementById('confetti-canvas');
        if (canvas === null) {
            canvas = document.createElement('canvas');
            canvas.setAttribute('id', 'confetti-canvas');
            canvas.setAttribute(
                'style',
                'display:block;z-index:99;pointer-events:none;position:fixed;top:0'
            );
            document.body.prepend(canvas);
            canvas.width = width;
            canvas.height = height;
            window.addEventListener(
                'resize',
                function () {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                },
                true
            );
            context = canvas.getContext('2d');
        } else if (context === null) context = canvas.getContext('2d');
        var count = confetti.maxCount;
        if (min) {
            if (max) {
                if (min == max) count = particles.length + max;
                else {
                    if (min > max) {
                        var temp = min;
                        min = max;
                        max = temp;
                    }
                    count =
                        particles.length +
                        ((Math.random() * (max - min) + min) | 0);
                }
            } else count = particles.length + min;
        } else if (max) count = particles.length + max;
        while (particles.length < count)
            particles.push(resetParticle({}, width, height));
        streamingConfetti = true;
        pause = false;
        runAnimation();
        if (timeout) {
            window.setTimeout(stopConfetti, timeout);
        }
    }

    function stopConfetti() {
        streamingConfetti = false;
    }

    function removeConfetti() {
        stop();
        pause = false;
        particles = [];
    }

    function toggleConfetti() {
        if (streamingConfetti) stopConfetti();
        else startConfetti();
    }

    function isConfettiRunning() {
        return streamingConfetti;
    }

    function drawParticles(context) {
        var particle;
        var x, y, x2, y2;
        for (var i = 0; i < particles.length; i++) {
            particle = particles[i];
            context.beginPath();
            context.lineWidth = particle.diameter;
            x2 = particle.x + particle.tilt;
            x = x2 + particle.diameter / 2;
            y2 = particle.y + particle.tilt + particle.diameter / 2;
            if (confetti.gradient) {
                var gradient = context.createLinearGradient(
                    x,
                    particle.y,
                    x2,
                    y2
                );
                gradient.addColorStop('0', particle.color);
                gradient.addColorStop('1.0', particle.color2);
                context.strokeStyle = gradient;
            } else context.strokeStyle = particle.color;
            context.moveTo(x, particle.y);
            context.lineTo(x2, y2);
            context.stroke();
        }
    }

    function updateParticles() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var particle;
        waveAngle += 0.01;
        for (var i = 0; i < particles.length; i++) {
            particle = particles[i];
            if (!streamingConfetti && particle.y < -15)
                particle.y = height + 100;
            else {
                particle.tiltAngle += particle.tiltAngleIncrement;
                particle.x += Math.sin(waveAngle) - 0.5;
                particle.y +=
                    (Math.cos(waveAngle) + particle.diameter + confetti.speed) *
                    0.5;
                particle.tilt = Math.sin(particle.tiltAngle) * 15;
            }
            if (
                particle.x > width + 20 ||
                particle.x < -20 ||
                particle.y > height
            ) {
                if (streamingConfetti && particles.length <= confetti.maxCount)
                    resetParticle(particle, width, height);
                else {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }
    }
})();

const start = () => {
    setTimeout(function () {
        confetti.start();
    }, 6000);
};

const stop = () => {
    setTimeout(function () {
        confetti.stop();
    }, 14000);
};

var userAgent = navigator.userAgent.toLowerCase();

if (/mobile/i.test(userAgent)) {
    document.body.style.display = 'flex';
    anim();
    start();
    stop();
} else {
    document.body.style.display = 'none';
}
