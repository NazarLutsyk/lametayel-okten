function whenClickOutside(container,onClickOutside){
    $(document).on('mouseup',function(e)
    {
        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0)
        {
            onClickOutside();
            $(document).off('mouseup')
        }
    });
}

