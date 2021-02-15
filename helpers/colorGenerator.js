const colorGen = () => {
    const colors = [
      // Red
      "#F24951",
      // Green
      "#65F088",
      // Blue
      "#6464ED",
      // Pink
      "#F07E84",
      // Orange
      "#F59D5A",
      // Purple
      "#CC71F0"
    ];

    let userColor = colors[Math.floor(Math.random() * colors.length)];
    return userColor;
}

exports.colorGen = colorGen;