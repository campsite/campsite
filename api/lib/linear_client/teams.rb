# frozen_string_literal: true

class LinearClient
  class Teams
    def initialize(client)
      @client = client
    end

    def get(next_cursor = nil)
      args = { first: 50 }
      args[:after] = next_cursor if next_cursor

      query = <<~GRAPHQL
        query {
          teams(#{@client.gql_params(args)}) {
            nodes {
              id
              name
              key
              private
            }
            pageInfo {
              endCursor
            }
          }
        }
      GRAPHQL

      @client.send(JSON[{ "query" => query }]).body
    end
  end
end
