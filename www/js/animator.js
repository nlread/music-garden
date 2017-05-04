class Animator {
    /**
     * Animation 1: Gets bigger then smaller, kind of like a pop.
     * Grows the component, then shrinks it over twice the time. 
     * @param {AnimatedComponent} animComp Component to animate
     * @param {Number} xGrowth Amount to grow in the x direction by
     * @param {Number} yGrowth Amount to grow in the y direction by
     * @param {Number} timing Time in seconds to increase size, twice as long to shrink
     */
    static pop(animComp, xGrowth = 1.2, yGrowth = 1.2, timing = 0.4) {
        animComp.animate(new ScalingAnimation(new Point(xGrowth, yGrowth), timing, 0));
        animComp.animate(new ScalingAnimation(new Point(1 / xGrowth, 1 / yGrowth), timing * 2, 0));
    }
    
    /**
     * Animation 2: Gets smaller then bigger.
     * Grows the component, then shrinks it over twice the time. 
     * @param {AnimatedComponent} animComp Component to animate
     * @param {Number} xGrowth Amount to grow in the x direction by
     * @param {Number} yGrowth Amount to grow in the y direction by
     * @param {Number} timing Time in seconds to increase size, twice as long to shrink
     */
    static swell(animComp, xGrowth = 1.3, yGrowth = 1.3, timing = 1) {
        animComp.animate(new ScalingAnimation(new Point(1/xGrowth, 1/yGrowth), timing/2, 0));
        animComp.animate(new ScalingAnimation(new Point(xGrowth, yGrowth), timing * 3, 0));
    }

    /**
     * Animation 3: Does a little spin motion, starting to the left. 
     * Rocks the component to the left, then to the right, then back to the center
     * @param {AnimatedComponent} animComp Component to animate
     * @param {Number} degreeChange Degree to rock left and right by (per side)
     * @param {Number} timing Time (in seconds) per turn
     */
    static sideToSideLeft(animComp, degreeChange = 15, timing = 0.15) {
        animComp.animate(new RotatingAnimation(-degreeChange, timing, 0));
        animComp.animate(new RotatingAnimation(degreeChange * 2, timing*2, timing));
        animComp.animate(new RotatingAnimation(-degreeChange, timing*3, timing * 2));
    }
    
    /**
     * Animation 4: Does a little spin/pop motion, starting to the right. 
     * Rocks the component to the left, then to the right, then back to the center
     * @param {AnimatedComponent} animComp Component to animate
     * @param {Number} xGrowth Amount to grow in the x direction by
     * @param {Number} yGrowth Amount to grow in the y direction by
     * @param {Number} degreeChange Degree to rock left and right by (per side)
     * @param {Number} timing Time (in seconds) per turn
     */
    static sideToSideRight(animComp, xGrowth = 1.2, yGrowth = 1.2, degreeChange = 15, timing = 0.1) {
        animComp.animate(new ScalingAnimation(new Point(xGrowth, yGrowth), timing*2, 0));
        animComp.animate(new ScalingAnimation(new Point(1 / xGrowth, 1 / yGrowth), timing * 4, 0));
        animComp.animate(new RotatingAnimation(degreeChange, timing, 0));
        animComp.animate(new RotatingAnimation(-degreeChange * 2, timing, timing));
        animComp.animate(new RotatingAnimation(degreeChange, timing*3, timing * 2));
    }
    
    /**
     * Animation 5: Does a springy growing animation. 
     * Scales vertically larger and horizontally smaller, then does the reverse. 
     * @param {AnimatedComponent} animComp Component to animate
     * @param {Number} xGrowth Amount to grow in the x direction by
     * @param {Number} yGrowth Amount to grow in the y direction by
     * @param {Number} timing Time (in seconds) per turn
     */
    static boink(animComp, xGrowth = 1.2, yGrowth = 1.2, timing = 0.5) {
        animComp.animate(new ScalingAnimation(new Point(1/xGrowth, yGrowth), timing, 0));
        animComp.animate(new ScalingAnimation(new Point(xGrowth, 1/yGrowth), timing, 0.1));
    } 
    
    /**
     * Animation 6: Does a slow zoom in/out motion. 
     * Scales larger and then smaller at a much slower pace. 
     * @param {AnimatedComponent} animComp Component to animate
     * @param {Number} xGrowth Amount to grow in the x direction by
     * @param {Number} yGrowth Amount to grow in the y direction by
     * @param {Number} timing Time (in seconds) per turn
     */
    static zoom(animComp, xGrowth = 1.3, yGrowth = 1.3, timing = 1) {
        animComp.animate(new ScalingAnimation(new Point(xGrowth, yGrowth), timing*0.75, 0));
        animComp.animate(new ScalingAnimation(new Point(1/xGrowth, 1/yGrowth), timing*4, 0));
    }
    
     /**
     * Animation 6: Squishes the plant vertically. 
     * Scales horizontally larger and vertically smaller, then does the reverse. 
     * @param {AnimatedComponent} animComp Component to animate
     * @param {Number} xGrowth Amount to grow in the x direction by
     * @param {Number} yGrowth Amount to grow in the y direction by
     * @param {Number} timing Time (in seconds) per turn
     */
    static squish(animComp, xGrowth = 1.3, yGrowth = 1.3, timing = 0.5) {
        animComp.animate(new ScalingAnimation(new Point(xGrowth,1/yGrowth),timing ,0));
        animComp.animate(new ScalingAnimation(new Point(1/xGrowth,yGrowth),timing,0.1));
    }
       
        
    } 