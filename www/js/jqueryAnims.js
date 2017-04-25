//Namespacing the menu animations for clarity/brevity
var menuAnims = {
    /*
     * Animates the menu on click - increases image size and highlights it
     * @param {HTML element} choice - div that is the menu button chosen
     */
    animateMenuChoice: function(choice){
        if(currentMenuChoice.src){
        oldMenuChoice =  currentMenuChoice;

        $(oldMenuChoice.firstChild).animate({
            height: "95%",
            width: "95%",
            backgroundColor: colors.menuColor
                }, 100
            );
        }

        $(choice.firstChild).animate({
            height: "100%",
            width: "100%"
            }, 100
        );

        $(choice).animate({
            backgroundColor: colors.menuSelectColor
            }, 100
        );  
    },

    /*
     * Reverts menu item to normal (smaller, unhighlighted) state
     * @param {HTML element} choice - div that is the menu button chosen
     */
    unHighlightMenuChoice: function(choice){
        $(choice.firstChild).animate({
            height: "95%",
            width: "95%"
            }, 100
        );

        $(choice).animate({
            backgroundColor: colors.menuColor
            }, 100
        );  
    }

    
    
}

var flowerAnims = {
    
}

