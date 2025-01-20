# Link Repair

A lightweight JavaScript library that automatically checks for broken links on your webpage and repairs them using the Wayback Machine.

## Features

- 🔍 Automatically scans all links on your page
- 🔄 Repairs broken links using Internet Archive's Wayback Machine
- 🎨 Fully customizable styling
- 📊 Detailed logging (optional)
- 🚀 Zero dependencies (apart from a valid link from wayback machine)
- 📱 Works in all modern browsers

## Quick Start

Add this single line to your HTML:

```html
<script src="https://filipegarcia.github.io/link-repair/main.js"></script>
```

That's it! The script will automatically start checking links on your page.

## Configuration

### Basic Configuration

You can customize the behavior by creating a new instance with options:

```javascript
new LinkRepair({
    contentSelector: '.my-content',  // Where to look for links
    verbose: true,                   // Enable detailed logging
    checkInterval: 5000             // Check every 5 seconds
});
```

### Style Customization

Customize the appearance of links being checked, repaired, or failed:

```javascript
new LinkRepair({
    styles: {
        checking: { 
            opacity: '0.5',
            border: '1px dotted #ccc'
        },
        repaired: { 
            backgroundColor: '#90EE90',
            textDecoration: 'underline'
        },
        failed: { 
            backgroundColor: '#FFB6C6',
            textDecoration: 'line-through'
        }
    }
});
```

### Custom Class Names

Use your own CSS classes:

```javascript
new LinkRepair({
    classNames: {
        checking: 'my-checking-class',
        repaired: 'my-repaired-class',
        failed: 'my-failed-class'
    }
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contentSelector` | string | 'body' | CSS selector for the area to check links |
| `checkInterval` | number | 5000 | Time between checks in milliseconds |
| `verbose` | boolean | false | Enable detailed console logging |
| `styles` | object | {...} | Custom styles for links |
| `classNames` | object | {...} | Custom class names for styling |

## Events and Logging

Enable verbose mode to see detailed logs:

```javascript
new LinkRepair({ verbose: true });
```

This will show:
- When links are found
- Each link check attempt
- Success/failure of repairs
- Summary statistics

## Contributing

Pull requests are welcome! Feel free to contribute to this project by submitting improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the Internet Archive's Wayback Machine for providing the archived versions
- Inspired by the need to maintain working links in old content
