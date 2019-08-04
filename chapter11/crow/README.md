# asdf

## `networking.js`

### sendGossip()

```mermaid
sequenceDiagram
    main() ->> networking.sendGossip(): sendGossip(bigOak, "Kids with airgun in the park");
    networking.sendGossip() ->> networking.request(): request(nest, neighbor, "gossip", message);
    networking.request() ->> networking.request.attempt(): nest.send(target, type, content, (failed, value) \=\> \{...\}
    networking.request.attempt() ->> Node: nest.send(target, type, content, (failed, value) \=\> \{...\}
    Node ->> Node: handler(...);
    networking.request.attempt() ->> Node: 'Get result'
    Node ->> networking.request.attempt(): 'Return nothing'
    networking.request.attempt() ->> networking.request(): 'Return nothing'
    networking.request() ->> networking.sendGossip(): 'Return nothing';
    networking.sendGossip() ->> main(): 'Return nothing'
```


### broadcastConnections()


### requestType()

```mermaid
sequenceDiagram
    main() ->> requestType(): requestType("ping", () => "pong")
    requestType() ->> defineRequestType(): asdf
    

```