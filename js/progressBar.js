export class ProgressBar {
    constructor(playerIndex, name, max, color) {
        this.playerIndex = playerIndex;
        this.name = name;
        this.currentValue = 0;
        this.maxValue = max;
        this.color = color;
    }

    buildDOMElement() {
        this.barElement = $("<div>", {
            class: "progress-bar"
        });
        this.fillElement = $("<div>", {
            class: "progress-bar-fill"
        });

        this.barElement.append(this.fillElement);
        return this.barElement;
    }

    updateValue(newVal, relative) {
        if (relative) this.currentValue += newVal;
        else this.currentValue = newVal;

        var percent = this.currentValue / this.maxValue;
        this.fillElement.width((percent * 100) + "%");
    }
}