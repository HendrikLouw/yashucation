var DW = DW || {};
DW.kmeans = DW.kmeans || {};
DW.kmeans.kmeans = function() {
  var distances = {
    euclidean: function(v1, v2) {
      var i, total;
      total = 0;
      i = 0;
      ["Latitude", "Longitude"].forEach(function(value){
        total += Math.pow(v2[value] - v1[value], 2);
      });
      return Math.sqrt(total);
    },
    manhattan: function(v1, v2) {
      var i, total;
      total = 0;
      i = 0;
      ["Latitude", "Longitude"].forEach(function(value){
        total += Math.pow(v2[value] - v1[value], 2);
      });
      return total;
    },
    max: function(v1, v2) {
      var i, max;
      max = 0;
      i = 0;
      ["Latitude", "Longitude"].forEach(function(value){
        total += Math.pow(v2[value] - v1[value], 2);
      });
      return max;
    }
  };
  var randomCentroids = function(points, k) {
    var centroids;
    centroids = points.slice(0);
    centroids.sort(function() {
      return Math.round(Math.random()) - 0.5;
    });
    return centroids.slice(0, k);
  };
  var closestCentroid =  function(point, centroids, distance) {
    var dist, i, index, min;
    min = Infinity;
    index = 0;
    i = 0;
    while (i < centroids.length) {
      dist = distance(point, centroids[i]);
      if (dist < min) {
        min = dist;
        index = i;
      }
      i++;
    }
    return index;
  };
  var kmeans = function(points, k, distance) {
    var arr, arrayResults, assigned, assignment, centroid, centroidResults, centroids, clusters, g, i, j, movement, newCentroid, result, sum, temp;
    distance = distance || "euclidean";
    if (typeof distance === "string" || "euclidean") {
      distance = distances[distance];
    }
    centroidResults = [];
    arrayResults = [];
    centroids = randomCentroids(points, k);
    assignment = new Array(points.length);
    clusters = new Array(k);
    movement = true;
    while (movement) {
      movement = false;
      result = [];
      i = 0;
      while (i < points.length) {
        arr = [];
        assignment[i] = closestCentroid(points[i], centroids, distance);
        arr.push(points[i]["Latitude"], points[i]["Longitude"], assignment[i], points[i]);
        result.push(arr);
        i++;
      }
      arrayResults.push(result);
      j = 0;
      temp = [];
      while (j < k) {
        assigned = [];
        assignment.forEach(function(centroid, index) {
          if (centroid === j) {
            return assigned.push(points[index]);
          }
        });
        if (!assigned.length) {
          continue;
        }
        centroid = centroids[j];
        newCentroid = new Array(2);
        ["Latitude", "Longitude"].forEach(function(value){
          sum = 0;
          i = 0;
          while (i < assigned.length) {
            sum +=assigned[i][value];
            i++;
          }
          newCentroid[value] = sum / assigned.length;
          if (newCentroid[value] !== centroid[value]) {
            movement = true;
          }
        });

        temp.push(newCentroid);
        clusters[j] = assigned;
        centroids[j] = newCentroid;
        j++;
      }
      centroidResults.push(temp);
    }
    return _.zip(centroidResults, arrayResults);;
  }

  return {
      kmeans: kmeans
  };
}
  
  // mainData = _.zip(returnData[0], returnData[1]);