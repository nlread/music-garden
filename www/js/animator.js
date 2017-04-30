class Animator {
    /**
     * Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
     * Grows the component, then shrinks it over twice the time. 
     * @param {AnimatedComponent} animComp Component to animate
     * @param {Number} xGrowth Amount to grow in the x direction by
     * @param {Number} yGrowth Amount to grow in the y direction by
     * @param {Number} timing Time in seconds to increase size, twice as long to shrink
     */
    static growShrink(animComp, xGrowth=1.3, yGrowth=1.3, timing=0.5) {
        newFlower.animate(new ScalingAnimation(new Point(xGrowth,yGrowth), timing, 0));
        newFlower.animate(new ScalingAnimation(new Point(1 / xGrowth, 1 / yGrowth), timing * 2, 0));
    }

    /**
     * Animation 2: Does a little spin thing. Kinda fun. 
     * Rocks the component to the left, then to the right, then back to the center
     * @param {AnimatedComponent} animComp Component to animate
     * @param {Number} degreeChange Degree to rock left and right by (per side)
     * @param {Number} timing Time (in seconds) per turn
     */
    static sideToSide(animComp, degreeChange=15, timing=0.1) {
        newFlower.animate(new RotatingAnimation(-degreeChange, timing, 0));
        newFlower.animate(new RotatingAnimation(degreeChange * 2, timing, timing));
        newFlower.animate(new RotatingAnimation(-degreeChange, timing, timing * 2));
    }
}

// ------------------------ > Drop Flower
//        newFlower.music.sound.on('play', function() {
//       
////            
////        //Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
//            //test flower
//          // newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.2,-1));
//           //newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1.1,0.1));
//            //Red flower
//      //     newFlower.animate(new ScalingAnimation(new Point(1/1.3,1.3),0.8,0));
//      //     newFlower.animate(new ScalingAnimation(new Point(1.3,1/1.3),1.2,0));
//            
////            Animation 2: Does a little spin thing. Kinda fun. 
//         //   newFlower.animate(new RotatingAnimation(-30,0.1,0));
//         //   newFlower.animate(new RotatingAnimation(15,0.1,0.1));
//         //   newFlower.animate(new RotatingAnimation(-5,0.1,0.2));
//         //   newFlower.animate(new RotatingAnimation(5,0.1,0.3));
//            
//        });

// ------------------- > Scale Flower
//            flowerSprite.music.sound.on('play', flowerSprite.stopAnimate());
            
//           flowerSprite.music.sound.on('play', function() {
//     
//            
////            Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
//            flowerSprite.animate(new ScalingAnimation(new Point(1.3,1.3),0.5,0));
//            flowerSprite.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1,0));
//            
////            Animation 2: Does a little spin thing. Kinda fun. 
////            newFlower.animate(new RotatingAnimation(-15,0.1,0));
////            newFlower.animate(new RotatingAnimation(30,0.1,0.1));
////            newFlower.animate(new RotatingAnimation(-15,0.1,0.2));
//        });