# Technical spec

## Interface Model

Behind this model the idea is following: 

- Every element can return reference to a collection it belongs to

- Request and Item can return reference to an idem they belong to

- Item may exist without a collection ( can be created separately )

- Request creation is private and also performed by an item via one of http-method calls

- Authentication interface is available both on the collection and item level

- Script interfaces on and pm and available only on the request level



![](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/ThePlenkov/newman-collection/master/docs/uml/interfaces.puml)
