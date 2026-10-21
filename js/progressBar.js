export class ProgressBar {
    constructor(playerIndex, name) {
        this.playerIndex = playerIndex;
        this.name = name;
    }

    buildDOMElement() {
        this.barElement = $("<div>", {
            class: "progress-bar"
        });
        this.fillElement = $("<div>", {
            class: "progress-bar-fill"
        });
        this.labelElement = $("<div>", {
            class: "progress-bar-label"
        });

        this.barElement.append(this.fillElement);
        this.barElement.append(this.labelElement);

        return this.barElement;
    }

    updateValue(newVal, newTotal) {
        this.currentValue = newVal;
        this.maxValue = newTotal;

        this.labelElement.empty().append(newVal + "/" + newTotal);
        var percent = this.currentValue / this.maxValue;
        this.fillElement.width((percent * 100) + "%");
    }
}