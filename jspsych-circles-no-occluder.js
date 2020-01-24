//circles bouncing plugin//

jsPsych.plugins["circles-no-occluder"] = (function() {

  var plugin = {};

  plugin.info = { //this block tells what to find in main script (specifies inputs)
    name: 'circles-no-occluder',
    description: '',
    parameters: {
      window_size: {
        type: jsPsych.plugins.parameterType.INT,
        array: true,
        pretty_name: 'Window Size',
        default: [1500, 1000],
        description: 'Determines the size of the rectangle in which circles bounce.'
      },
      window_position: {
        type: jsPsych.plugins.parameterType.INT,
        array: true,
        pretty_name: 'Window Position',
        default: [0, 0],
        description: 'Position of the rectangle.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      n_objects: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'N Objects',
        default: 100,
        description: 'Populates the rectangle with N objects.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide stimulus.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

display_element.innerHTML += "Every screen is a different distribution.<br>We know the trial may have been brief, but give your best guess.<br><br>";

    circle_show (display_element, trial.window_size[0], trial.window_size[1],
                                  trial.window_position[0], trial.window_position[1],
                                  trial.trial_duration,
                                  trial.n_objects,
                                  trial.proportion,
                                  trial.rect_size[0], trial.rect_size[1]);



      var startTime = (new Date()).getTime();

      function dotprod(A,B){
        var out=0;
        for (i=0;i<A.length;i++){
          out+=A[i]*B[i];
        }
        return out
      }

      function visible_proportion_calc(){
        var viscount = Array.prototype.slice.call(document.getElementsByTagName("circle")).map(function (el) {return parseInt(el.getAttribute('visible'))==0 ? 1:0})
        var tot_viscount = viscount.reduce(function(a,b) {return a+b;}, 0)
        var is_blue = Array.prototype.slice.call(document.getElementsByTagName("circle")).map(function (el) {return el.getAttribute('style').slice(10,12)=="31" ? 1:0})
        var blue_viscount = dotprod(is_blue,viscount)
        //var vis_prop = blue_viscount/tot_viscount;
        return[blue_viscount, tot_viscount]
      }


    // store response
    var response = {
      rt: null,
      "response": null
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      // if (typeof keyboardListener !== 'undefined') {
      //   jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      // }

      // gather the data to store for the trial
      // var trial_data = {
      //   "rt": response.rt,
      //   "stimulus": trial.stimulus,
      //   "response": response.val,
      //   "visable_proportions": vis_prop_arr
      // };

      // move on to the next trial
      jsPsych.finishTrial(trialdata);
    };

    // function to handle responses by the subject
    var after_response = function(info) {
      if (response.key == null) {
        response = info;
      }
      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    var log_interval = 100
    //var vis_prop_arr = []
    var vis_blue_arr = []
    var vis_tot_arr = []
    var arr=[]
    var rapidlog = setInterval (function () {
      arr=visible_proportion_calc()
      vis_blue_arr.push(arr[0])
      vis_tot_arr.push(arr[1])
    },log_interval)

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        clearInterval(rapidlog);
        paper = ""
        display_element.querySelector('.jspsych-circles-stimulus').style.visibility = 'hidden';
        paper += '<div id="jspsych-survey-text-"'+i+'" class="jspsych-survey-text-question" style="margin: 2em 0em;">';

        paper += '<p class="jspsych-survey-text">' + trial.prompt + '</p>';
        paper += '<input type="text" id="inputfield1" name="#jspsych-survey-text-response-1" size="50px"> </input>';

        paper += '<button type=submit id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text">Submit</button>';
        paper += '<p class="jspsych-survey-text" id="enter-statement"><i>Enter a number between 0 and 100</i></p>';
        paper += '</div>';
        display_element.innerHTML += paper

        document.getElementById("inputfield1").select();

        document.getElementById("inputfield1").addEventListener("keyup", function(event) {
            if(event.key !== "Enter") return; // Use `.key` instead.
            display_element.querySelector('#jspsych-survey-text-next').click(); // Things you want to do.
            event.preventDefault(); // No need to `return false;`.
        });

        display_element.querySelector('#jspsych-survey-text-next').addEventListener('click', function() {
          var question_data = {};
          var matches = display_element.querySelectorAll('div.jspsych-survey-text-question');
          for(var index=0; index<matches.length; index++){
            var id = "Q" + index;
            //console.log(matches)
            //console.log(matches[index])
            var val = matches[index].querySelector('textarea, input').value;
            //console.log(val)
            var obje = {};
            obje[id] = val;
            Object.assign(question_data, obje);
          }

        if (obje["Q0"]<=100 && obje["Q0"]>=0 && obje["Q0"]!=""){
        // measure response time
          var endTime = (new Date()).getTime();
          var response_time = endTime - startTime;

        // save data
          var trialdata = {
            "rt": response_time,
            "responses": JSON.stringify(question_data),
            "visible_blue": JSON.stringify(vis_blue_arr),
            "visible_total": JSON.stringify(vis_tot_arr),
            "actual_proportion": JSON.stringify(trial.proportion[0]/100),
            "trial_duration": JSON.stringify(trial.stimulus_duration),
            "occluder_size": JSON.stringify(trial.rect_size[0])

          };

          display_element.innerHTML = '';

        // next trial
          jsPsych.finishTrial(trialdata);
        } else{
          var id = "enter-statement"
          var div = document.getElementById(id);
          div.innerHTML = "<i><b><font color = 'red'>Enter a number between 0 and 100</font></b></i>"
        }
      });

      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is se
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };

    var circle_show = function (display_element, w, h, x, y, d, n, p, rW, rH) {
      var margin = {top: 0, right: 0, bottom: 0, left: 0},

      //size of rectangle
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;


      //dist of rect from margin
      var rect = [x, y, width, height];

////a couple functions to set up indexing to assign features (colors, here) to circles
      var accu_arr = function(p_arr) {
        accu = []
        for (i = 0; i < p_arr.length; i++){
            if (i == 0) {
              accu[i] = p_arr[i]
            } else {
              accu[i] = accu[i - 1] + p_arr[i];
            }
          }
      //renormalizing
        out = accu.map(el=>el/accu[accu.length-1]);
        return out
      }

      var index_of_p = function(p,p_arr){
        arr = accu_arr(p_arr);
        for (i=0;i<=arr.length;i++){
          if (p<arr[i]){
            return i
          }
        }
      }

      m = p.length, //# colors
      padding = 3, //how close they can get
      maxSpeed = 3, //max speed
      radius = d3.scale.sqrt().range([20,20]), //range of circle sizes
      color = d3.scale.category10().domain(d3.range(m));
      //console.log(color)
      colors = [];
      for (j = 0; j < n; j++){
        colors[j] = color(index_of_p(j/n, p))
        //console.log(n)
      };
      var nodes = [];
      //console.log(colors)

      for (i in d3.range(n)){
      nodes.push({radius: radius(1 + Math.floor(Math.random() * 4)), //how size determined
      color: colors[i],//color(Math.floor(Math.random() * m)), //how color determined
      x: rect[0] + (Math.random() * (rect[2] - rect[0])), //starting coordinates maybe??
      y:rect[1] + (Math.random() * (rect[3] - rect[1])),
      speedX: (Math.random() - 0.5) * 2 *maxSpeed, //how speed determined
      speedY: (Math.random() - 0.5) * 2 *maxSpeed}); //not sure difference?
      }


      var force = d3.layout.force()
      .nodes(nodes)
      .size([width, height])
      .gravity(0) //how dots hang together?
      .charge(0) //not sure difference, but similar
      .on("tick", tick)
      .start();

      //maybe this is what places the big rectangle?
      var svg = d3.select(display_element).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class",'jspsych-circles-stimulus')
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //formatting of border of rectangle
      svg.append("svg:rect")
      .attr("width", rect[2] - rect[0])
      .attr("height", rect[3] - rect[1])
      .attr("x", rect[0])
      .attr("y", rect[1])
      .style("fill", "None")
      .style("stroke", "#222222");

      // //GREEBLE VERSIONhow attributes assigned to circles GREEBLE VERSION
      // var circle = svg.selectAll("circle.value")
      // .data(nodes)
      // .enter().append("image")
      // .attr("href", "img/testingalphachannels.png")
      // .attr("width", function(d) { return d.radius; })
      // .attr("x", function(d) { return d.x; })
      // .attr("y", function(d) { return d.y; })
      // // .style("fill", function(d) { return d.color; })
      // //.call(force.drag); //turning off ability to drag circles

      //occluder dimensions defined so that visible can call them
      //dimensions needed for building rectangles
      w1 = rW - margin.left - margin.right,
      h1 = rH - margin.top - margin.bottom;

      //right hand rectangle
      var r1 = [0,0, w1, rect[3]];
      //top rectangle
      var r2 = [0,0, rect[2], h1];
      // //left hand rectangle
      var r3 = [rect[2]-w1,0, w1, rect[3]];
      // //bottom rectangle
      var r4 = [0, rect[3]-h1, rect[2], h1];

      //how attributes assigned to circles
      var circle = svg.selectAll("circle.value")
      .data(nodes)
      .enter().append("circle")
      .attr("r", function(d) { return d.radius; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("visible", function(d) { return ((d.x>r1[2]) & (d.x < 700) & (d.y>300) & (d.y < 600)); })
      .style("fill", function(d) { return d.color; })
      //.call(force.drag); //turning off ability to drag circles


//------------------------------------RECTANGLES TO REDUCE WINDOW SIZE

      // //dimensions needed for building rectangles
      // w1 = rW - margin.left - margin.right,
      // h1 = rH - margin.top - margin.bottom;
      //
      // //right hand rectangle
      // var r1 = [0,0, w1, rect[3]];
      //putting it on the screen
      svg.append("svg:rect")
      .attr("width", r1[2] - r1[0])
      .attr("height", r1[3] - r1[1])
      .attr("x", r1[0])
      .attr("y", r1[1])
      .style("fill")//, "None")
      //.style("stroke", "#222222");
      //svg.append('rect')
      //.attrs({x:10, y: 10, width: 80, height: 80, fill: 'red'});

      // //top rectangle
      // var r2 = [0,0, rect[2], h1];
      // // putting it on the screen
      svg.append("svg:rect")
      .attr("width", r2[2]-r2[0])
      .attr("height", r2[3] - r2[1])
      .attr("x", r2[0])
      .attr("y", r2[1])
      .style("fill")//, "None")

      // // //left hand rectangle
      // var r3 = [rect[2]-w1,0, w1, rect[3]];
      // // putting it on the screen
      svg.append("svg:rect")
      .attr("width", r3[0])
      .attr("height", r3[3] - r3[1])
      .attr("x", r3[0])
      .attr("y", r3[1])
      .style("fill")//, "None")

      // // //bottom rectangle
      // var r4 = [0, rect[3]-h1, rect[2], h1];
      // putting it on the screen
      svg.append("svg:rect")
      .attr("width", r4[2]-r4[0])
      .attr("height", r4[1])
      .attr("x", r4[0])
      .attr("y", r4[1])
      .style("fill")//, "None")

//------------------------------------

      //not sure here
      var flag = false;
      function tick(e) {
      force.alpha(0.1)
      circle
      .each(gravity(e.alpha))
      .each(collide(.5))
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("visible", function(d) { return ((d.x>r1[2]) & (d.x < 700) & (d.y>300) & (d.y < 600)); });
      }

//------------------------------------GRAVITY & PHYSICS
      function gravity(alpha) {
      return function(d) {
      if ((d.x - d.radius - 2) < rect[0]) d.speedX = Math.abs(d.speedX);
      if ((d.x + d.radius + 2) > rect[2]) d.speedX = -1 * Math.abs(d.speedX);
      if ((d.y - d.radius - 2) < rect[1]) d.speedY = -1 * Math.abs(d.speedY);
      if ((d.y + d.radius + 2) > rect[3]) d.speedY = Math.abs(d.speedY);

      d.x = d.x + (d.speedX * alpha);
      d.y = d.y + (-1 * d.speedY * alpha);

      };
      }

      // Resolve collisions between nodes.
      function collide(alpha) {
      var quadtree = d3.geom.quadtree(nodes);
      return function(d) {
      var r = d.radius + radius.domain()[1] + padding,
      nx1 = d.x - r,
      nx2 = d.x + r,
      ny1 = d.y - r,
      ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
          y = d.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
          if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2
      || x2 < nx1
      || y1 > ny2
      || y2 < ny1;
      });
      };
      }
    }

  return plugin;
})();
