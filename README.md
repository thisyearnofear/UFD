# FUD CTO

Farts, Unicorns, and Donald

## Recent Updates

### Leaderboard Smart Contract

The game now features an on-chain leaderboard system built on Solana, offering two types of score submissions:

1. **Paid Entries**

   - Cost: 500 $FUD tokens
   - Requires minimum wallet balance of 100,000 $FUD
   - No cooldown period
   - Eligible for larger prizes

2. **Free Entries**
   - No cost (only Solana transaction fee)
   - 24-hour cooldown period between submissions
   - Eligible for smaller prizes

### Key Features

- **Anti-Cheat Protection**: Implements nonce-based replay protection with 5-minute expiry
- **Pagination**: Supports efficient leaderboard queries with up to 100 entries per request
- **Reset History**: Maintains history of past leaderboard resets (last 10 resets)
- **Prize Distribution**: Manual distribution by authority (game developer)
- **Token Management**: Secure vault system for handling $FUD token deposits
- **Event Tracking**: Emits events for score submissions, withdrawals, and resets

### Technical Details

- Program ID: `5An7W1oQjTpUW3tq3kgiH2v5MXMKogz97yMYnmqc9Edq`
- Built with Anchor framework
- Scores are stored as individual accounts for efficient querying
- Implements security measures against duplicate submissions
- Supports both paid and free entry tracking

## Original Credits

- [anime.js](http://anime-js.com/) by Julian Garnier
- [Charming.js](https://github.com/yuanqing/charming) by Yuan Qing
- [imagesLoaded](http://imagesloaded.desandro.com/) by Dave DeSandro
- "Kidnap" letters created with [Ransomizer](http://www.ransomizer.com/)
- [Death icon](http://www.flaticon.com/free-icon/risk-of-death_65525) by [Freepik](http://www.freepik.com/)

## Development

python -m http.server 8000

## Credits

- [anime.js](http://anime-js.com/) by Julian Garnier
- [Charming.js](https://github.com/yuanqing/charming) by Yuan Qing
- [imagesLoaded](http://imagesloaded.desandro.com/) by Dave DeSandro
- "Kidnap" letters created with [Ransomizer](http://www.ransomizer.com/)
- [Death icon](http://www.flaticon.com/free-icon/risk-of-death_65525) by [Freepik](http://www.freepik.com/)

## License

This resource can be used freely if integrated or build upon in personal or commercial projects such as websites, web apps and web templates intended for sale. It is not allowed to take the resource "as-is" and sell it, redistribute, re-publish it, or sell "pluginized" versions of it. Free plugins built using this resource should have a visible mention and link to the original work. Always consider the licenses of all included libraries, scripts and images used.
