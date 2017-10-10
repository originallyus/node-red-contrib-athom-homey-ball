module.exports = function(RED) 
{
    //variables placed here are shared by all nodes

    //NodeRED node constructor
    function AthomHomeyNode(config) 
    {
        RED.nodes.createNode(this, config);
        var thisNode = this;

    }

    //NodeRED registration
    RED.nodes.registerType("athom-homey-ball", AthomHomeyNode, {
      settings: {
          
      }
    });

}
