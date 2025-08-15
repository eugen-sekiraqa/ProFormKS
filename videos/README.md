# Video Carousel Setup

## How to Add Videos

1. **Supported Formats**: MP4, WebM, MOV
2. **Recommended Resolution**: 1280x720 (720p) or 1920x1080 (1080p)
3. **File Size**: Keep under 50MB for optimal loading
4. **Duration**: 1-3 minutes recommended

## File Naming Convention

Use descriptive names for your video files:
- `training-demo-1.mp4` - Speed & Agility Training
- `training-demo-2.mp4` - Strength & Conditioning  
- `training-demo-3.mp4` - Recovery & Mobility

## Adding New Videos

1. Place your video files in this `videos/` folder
2. Update the HTML in `index.html` to include new video slides
3. Update the navigation dots to match the number of videos
4. Ensure video sources point to the correct file paths

## Video Content Ideas

- **Training Demonstrations**: Show proper form and technique
- **Before/After Transformations**: Real client results
- **Workout Routines**: Complete training sessions
- **Coach Introductions**: Personal stories and expertise
- **Facility Tours**: Showcase your training space
- **Client Testimonials**: Video testimonials from athletes

## Performance Tips

- Compress videos to reduce file size
- Use WebM format for better compression
- Add poster images for faster loading
- Consider lazy loading for multiple videos

## Example HTML Structure

```html
<div class="video-slide">
    <div class="video-wrapper">
        <video class="video-player" controls poster="path/to/poster.jpg">
            <source src="videos/your-video.mp4" type="video/mp4">
            <source src="videos/your-video.webm" type="video/webm">
            Your browser does not support the video tag.
        </video>
        <div class="video-info">
            <h3>Your Video Title</h3>
            <p>Description of what the video shows.</p>
        </div>
    </div>
</div>
```

## Navigation Dots

Don't forget to add corresponding navigation dots:

```html
<div class="video-dots">
    <span class="video-dot active" data-video="0"></span>
    <span class="video-dot" data-video="1"></span>
    <span class="video-dot" data-video="2"></span>
    <!-- Add more dots for each video -->
</div>
```

## Troubleshooting

- **Videos not playing**: Check file paths and formats
- **Carousel not working**: Ensure JavaScript is loaded
- **Mobile issues**: Test touch/swipe functionality
- **Performance**: Optimize video file sizes 