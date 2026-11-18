import graphene
import karhutla_api.schema

class Query(karhutla_api.schema.Query, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query)
