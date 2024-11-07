// Particle canvas setup
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let mouse = {
    x: undefined,
    y: undefined,
    radius: 150
}

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Flow field configuration
const FLOW_FIELD_SCALE = 20;
const NOISE_SCALE = 0.005;
let time = 0;

// Enhanced Particle class with flow field behavior
class Particle {
    constructor() {
        this.reset();
        this.size = Math.random() * 2 + 1;
        this.shadowLength = Math.random() * 10 + 5;
        this.speed = Math.random() * 2 + 1;
        this.life = 0;
        this.maxLife = Math.random() * 200 + 200;
        // Golden color variations
        this.hue = Math.random() * 20 + 40; // Range around golden/yellow
        this.brightness = Math.random() * 20 + 80; // High brightness for glow effect
    }

    reset() {
        // Start from edges for continuous flow
        if (Math.random() > 0.5) {
            this.x = Math.random() > 0.5 ? 0 : canvas.width;
            this.y = Math.random() * canvas.height;
        } else {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() > 0.5 ? 0 : canvas.height;
        }
        this.life = 0;
    }

    draw() {
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x - this.velocityX * this.shadowLength,
            this.y - this.velocityY * this.shadowLength
        );
        
        const alpha = 1 - (this.life / this.maxLife);
        // Primary particle color (golden/yellow with slight variations)
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, ${this.brightness}%, ${alpha * 0.8})`);
        // Outer glow color (warmer tone)
        gradient.addColorStop(0.5, `hsla(${this.hue - 5}, 100%, ${this.brightness - 10}%, ${alpha * 0.4})`);
        // Fade out completely
        gradient.addColorStop(1, `hsla(${this.hue}, 100%, ${this.brightness}%, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x - this.velocityX * this.shadowLength,
            this.y - this.velocityY * this.shadowLength
        );
        ctx.stroke();
    }

    update() {
        // Get angle from noise field
        const angle = this.getFlowFieldAngle(this.x, this.y);
        
        // Calculate velocity based on angle
        this.velocityX = Math.cos(angle) * this.speed;
        this.velocityY = Math.sin(angle) * this.speed;

        // Mouse interaction
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                this.velocityX -= Math.cos(angle) * force * 2;
                this.velocityY -= Math.sin(angle) * force * 2;
                
                // Intensify color when near mouse
                this.brightness = Math.min(100, this.brightness + force * 10);
            }
        }

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Update life and reset if needed
        this.life++;
        if (this.life > this.maxLife || 
            this.x < 0 || this.x > canvas.width || 
            this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    getFlowFieldAngle(x, y) {
        // Simplified Perlin noise simulation for flow field
        const xOffset = x * NOISE_SCALE;
        const yOffset = y * NOISE_SCALE;
        const timeOffset = time * 0.0002;
        
        return (Math.sin(xOffset + timeOffset) * Math.cos(yOffset) + 
                Math.cos(xOffset) * Math.sin(yOffset + timeOffset)) * Math.PI * 2;
    }
}

// Create particle array
const particles = [];
const numberOfParticles = 300;

function init() {
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
    }
}
init();

// Animation function
function animate() {
    // Darker fade for better contrast with golden particles
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw connecting lines between particles
    for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 215, 0, ${0.1 - distance / 1000})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    time++;
    requestAnimationFrame(animate);
}

// Set initial background
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

animate();

// Animation for typewriter effect
const professions = ["App Development", "Game Development", "UI/UX", "Frontend Development"];
let professionIndex = 0;
let charIndex = 0;
let isDeleting = false;
const professionText = document.getElementById("professionText");

function typeEffect() {
    const currentProfession = professions[professionIndex];
    const displayedText = currentProfession.substring(0, charIndex);

    professionText.textContent = displayedText;

    if (!isDeleting && charIndex < currentProfession.length) {
        // Type out characters
        charIndex++;
        setTimeout(typeEffect, 100); // Speed of typing
    } else if (isDeleting && charIndex > 0) {
        // Erase characters
        charIndex--;
        setTimeout(typeEffect, 50); // Speed of deleting
    } else {
        // Switch between typing and deleting
        isDeleting = !isDeleting;

        if (!isDeleting) {
            // Move to the next profession after pause
            professionIndex = (professionIndex + 1) % professions.length;
            setTimeout(typeEffect, 1000); // Pause before typing the next profession
        } else {
            setTimeout(typeEffect, 200); // Pause before erasing
        }
    }
}

// Start the typewriter animation
typeEffect();

// Fade in effect for the about section
const aboutText = document.querySelector('.about-text');

function checkVisibility() {
    const section = document.getElementById('about');
    const sectionTop = section.getBoundingClientRect().top;
    const viewportHeight = window.innerHeight;

    // Trigger animation when the section is in view
    if (sectionTop < viewportHeight * 0.75) {
        aboutText.classList.add('visible');
    }
}

// Check visibility on scroll
window.addEventListener('scroll', checkVisibility);

// Also check on initial load
document.addEventListener('DOMContentLoaded', checkVisibility);

// Smooth scrolling and active link handling
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Get all sections
    const sections = document.querySelectorAll('section');
    
    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Update active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
});

