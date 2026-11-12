import subprocess
import json

script = """
const card = document.querySelector('.rounded-3xl');
const cardRect = card.getBoundingClientRect();
console.log(JSON.stringify({
  bodyWidth: document.body.offsetWidth,
  cardWidth: cardRect.width,
  cardLeft: cardRect.left,
  cardRight: cardRect.right,
  children: Array.from(card.querySelectorAll('*')).filter(el => el.getBoundingClientRect().width > 300).map(el => ({
    tag: el.tagName,
    cls: el.className,
    width: el.getBoundingClientRect().width,
    scrollWidth: el.scrollWidth
  }))
}));
"""

# Let's run chrome with remote debugging or headless dump
# Or let's inspect the css classes directly

