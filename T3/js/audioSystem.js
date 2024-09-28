/**
 * @typedef {'player-damage' | 'bot-damage' | 'player-shoot'| 'turret-shoot'| 'music'} SoundKey
 */

class AudioSystem {
    constructor() {
        // Object to store audio elements
        this.sounds = {
            "player-damage": new Audio(
                "./assets/audio/discord-notification.mp3"
            ),
            "bot-damage": new Audio("./assets/audio/villager_damage.mp3"),
            "player-shoot": new Audio("./assets/audio/shot.mp3"),
            "turret-shoot": new Audio("./assets/audio/beam-rifle-fire.mp3"),
            "music": new Audio("./assets/audio/pigstep.mp3"),
        };

        // Optionally, set default volume for all sounds
        Object.values(this.sounds).forEach((sound) => {
            sound.volume = 0.5; // Adjust default volume (0.5 = 50%)
        });

        // Store original volume levels for each sound
        this.originalVolumes = {};
        Object.keys(this.sounds).forEach((key) => {
            this.originalVolumes[key] = this.sounds[key].volume; // Save original volume
        });

        // Mute state tracker
        this.isMuted = false;
    }

    /**
     * Play a sound by key
     * @param {SoundKey} key - The key of the sound to play
     * @param {boolean} [loop=false] - Whether the sound should loop
     * @param {number} [volume=0.5] - Volume level between 0 and 1
     */
    play(key, loop = false, volume = 0.5) {
        const sound = this.sounds[key];
        if (sound) {
            sound.loop = loop;

            // If the system is muted, set volume to 0, otherwise set to the provided volume
            if (this.isMuted) {
                sound.volume = 0;
            } else {
                sound.volume = volume;
                this.originalVolumes[key] = volume; // Save the original volume
            }

            sound.currentTime = 0;
            sound.play().catch((error) => {
                console.error(
                    `Failed to play sound "${key}": ${error.message}`
                );
            });
        } else {
            console.error(`Sound "${key}" not found.`);
        }
    }

    /**
     * Stop a sound by key
     * @param {SoundKey} key - The key of the sound to pause
     */
    stop(key) {
        const sound = this.sounds[key];
        if (sound) {
            sound.pause();
            sound.currentTime = 0; // Reset sound to start
        } else {
            console.error(`Sound "${key}" not found.`);
        }
    }

    /**
     * Pause a sound by key
     * @param {SoundKey} key - The key of the sound to pause
     */
    pause(key) {
        const sound = this.sounds[key];
        if (sound) {
            sound.pause();
        } else {
            console.error(`Sound "${key}" not found.`);
        }
    }
    /**
     * Toggle mute/unmute for all sounds by setting volume to 0 or restoring original volume.
     */
    toggleMuteAll() {
        if (this.isMuted) {
            // Unmute all sounds by restoring original volumes
            Object.keys(this.sounds).forEach((key) => {
                this.sounds[key].volume = this.originalVolumes[key];
            });
            this.isMuted = false;
        } else {
            // Mute all sounds by setting volume to 0 and storing current volume levels
            Object.keys(this.sounds).forEach((key) => {
                this.originalVolumes[key] = this.sounds[key].volume; // Save the current volume
                this.sounds[key].volume = 0; // Set volume to 0 to mute
            });
            this.isMuted = true;
        }
    }
}

// Create and export a singleton instance of AudioSystem
const audioSystem = new AudioSystem();
export default audioSystem;
