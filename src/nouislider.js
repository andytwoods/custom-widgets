import noUiSlider from "nouislider";

function init(Survey) {
  var widget = {
    name: "nouislider",
    title: "noUiSlider",
    iconName: "icon-nouislider",
    widgetIsLoaded: function () {
      return typeof noUiSlider != "undefined";
    },
    isFit: function (question) {
      return question.getType() === "nouislider";
    },
    htmlTemplate:
      "<div><div></div></div><style>.noUi-origin { width: 0; }</style>",
    activatedByChanged: function (activatedBy) {
      Survey.JsonObject.metaData.addClass("nouislider", [], null, "empty");
      Survey.JsonObject.metaData.addProperties("nouislider", [
        {
          name: "step:number",
          category: "slider",
          categoryIndex: 1,
          default: 1,
        },
        {
          name: "rangeMin:number",
          category: "slider",
          default: 0,
        },
        {
          name: "rangeMax:number",
          category: "slider",
          default: 100,
        },
        {
          name: "pipsMode",
          category: "slider",
          default: "positions",
        },
        {
          name: "pipsText:itemvalues",
          category: "slider",
          default: [0, 25, 50, 75, 100],
        },
        {
          name: "pipsOrientation:itemvalues",
          displayName: "label orientation (left, center [default], right)",
          category: "slider",
          default: [0, 25, 50, 75, 100],
        },
        {
          name: "pipsDensity:number",
          category: "slider",
          default: 5,
        },
        {
          name: "orientation",
          category: "slider",
          default: "horizontal",
          choices: ["horizontal", "vertical"]
        },
        {
          name: "direction:string",
          category: "slider",
          default: "ltr",
        },
        {
          name: "tooltips:boolean",
          category: "slider",
          default: true,
        },
        {
          name: "decimals:int",
          category: "slider",
          default: 0,
        },
      ]);
    },
    afterRender: function (question, el) {
      el.style.paddingBottom = "19px";
      el.style.paddingLeft = "20px";
      el.style.paddingRight = "20px";
      el.style.paddingTop = "44px";
      el = el.children[0];
      el.style.marginBottom = "60px";
      if (question.orientation === "vertical") {
        el.style.height = "250px";
      }
      var slider = noUiSlider.create(el, {
        start: question.value || (question.rangeMin + question.rangeMax) / 2,
        connect: [true, false],
        step: question.step,
        tooltips: question.tooltips,
        format: wNumb({
          decimals: question.decimals
        }),
        pips: {
          mode: question.pipsMode || "positions",
          values: question.pipsText.map(function (pVal) {
            var pipValue = pVal;
            if (pVal.value !== undefined) {
              pipValue = pVal.value;
            }
            return parseInt(pipValue);
          }),
          density: question.pipsDensity || 5,
          format: {
            to: function (pVal) {
              var pipText = pVal;
              const origPVal = pVal;
              question.pipsText.map(function (el) {
                if (el.text !== undefined && pVal === el.value) {
                  pipText = el.text;
                }
              });
              function alignment(txt){
                var found = question.pipsOrientation.find(function(el){
                  return el.text!==undefined && pVal === el.value;
                });
                if(found){
                  switch(found.text.toLowerCase()) {
                    case('left'):
                      return "<div style='transform: translateX(50%);'>" + txt + "</div>";
                    case('right'):
                      return "<div style='transform: translateX(-50%);'>" + txt + "</div>";
                  }
                }
                return txt;
              }
              if(pipText == origPVal){
                console.log(question.decimals,22)
                var val = Number(origPVal).toFixed(question.decimals);
                return alignment(val);
              }
              return alignment(pipText);
            },
            from: function (value) {
              return Number(value).toFixed(question.decimals);
            }
          },
        },
        range: {
          min: question.rangeMin,
          max: question.rangeMax,
        },
        orientation: question.orientation,
        direction: question.direction,
      });
      slider.on("change", function () {
        question.value = Number(slider.get());
      });
      var updateValueHandler = function () {
        slider.set(question.value);
      };
      if (question.isReadOnly) {
        el.setAttribute("disabled", true);
      }
      updateValueHandler();
      question.noUiSlider = slider;
      question.valueChangedCallback = updateValueHandler;
      question.readOnlyChangedCallback = function () {
        if (question.isReadOnly) {
          el.setAttribute("disabled", true);
        } else {
          el.removeAttribute("disabled");
        }
      };
    },
    willUnmount: function (question, el) {
      if (!!question.noUiSlider) {
        question.noUiSlider.destroy();
        question.noUiSlider = null;
      }
      question.readOnlyChangedCallback = null;
    },
    pdfRender: function (_, options) {
      if (options.question.getType() === "nouislider") {
        var point = options.module.SurveyHelper.createPoint(
          options.module.SurveyHelper.mergeRects.apply(null, options.bricks)
        );
        point.xLeft += options.controller.unitWidth;
        point.yTop +=
          options.controller.unitHeight *
          options.module.FlatQuestion.CONTENT_GAP_VERT_SCALE;
        var rect = options.module.SurveyHelper.createTextFieldRect(
          point,
          options.controller
        );
        var textboxBrick = new options.module.TextFieldBrick(
          options.question,
          options.controller,
          rect,
          true,
          options.question.id,
          options.question.value || options.question.defaultValue || "",
          "",
          options.question.isReadOnly,
          false,
          "text"
        );
        options.bricks.push(textboxBrick);
      }
    },
  };

  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "customtype");
}

if (typeof Survey !== "undefined") {
  init(Survey);
}

export default init;
