# Afterschool Tech Lesson Builder

An interactive lesson builder for creating engaging educational content with Duolingo-style feedback and gamification.

## Features

- Drag-and-drop lesson building
- Interactive components (quizzes, matching pairs, code editors, etc.)
- Duolingo-style animations and sound effects
- Real-time preview mode
- Progress tracking and scoring
- Export/import lessons as JSON

## Sound Effects System

The application uses a robust sound effects system powered by Howler.js. Sound effects include:

- `correct.mp3`: Played when an answer is correct
- `incorrect.mp3`: Played when an answer is incorrect
- `click.mp3`: Played for general UI interactions
- `complete.mp3`: Played when a lesson or section is completed
- `levelUp.mp3`: Played when achieving a milestone
- `streak.mp3`: Played when maintaining a streak

Sound effects can be customized by placing MP3 files in the `/public/sounds` directory. The system will automatically fall back to hosted versions if local files are not found.

## Animations

The application includes a variety of Duolingo-style animations:

- `duo-bounce`: Bouncy feedback for correct answers
- `duo-shake`: Shake effect for incorrect answers
- `duo-celebrate`: Celebration animation for completing lessons
- `duo-pop`: Pop effect for button clicks
- `duo-float`: Floating animation for hints and tooltips
- `duo-pulse`: Pulsing effect for streaks and achievements
- `duo-flip`: Card flip animation
- `duo-wiggle`: Wiggle animation for hints
- `duo-zoom`: Zoom animation for focus

Animations can be combined and customized using utility classes:
- `duo-delay-[100-500]`: Add animation delays
- `duo-duration-[100-500]`: Customize animation duration

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customizing Feedback

The feedback system can be customized through the settings panel:

- Enable/disable sound effects
- Adjust sound volume
- Enable/disable animations
- Test different feedback types

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Sound effects from [Mixkit](https://mixkit.co/free-sound-effects/)
- Animations inspired by Duolingo's gamification system