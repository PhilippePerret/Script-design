define(
  [],
  function()
  {
    class Events
    {
      static stop (evt)
      {
        evt.stopPropagation()
        evt.preventDefault()
        return false
      }
    }

    return Events
  }
)
