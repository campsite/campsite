# frozen_string_literal: true

class LinearClient
  class Issues
    def initialize(client)
      @client = client
    end

    def create(title:, description:, team_id:, member:)
      query_template = %{
        mutation IssueCreate($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              id
              title
              url
              identifier
              description
              state {
                id
                name
                type
                color
              }
            }
          }
        }
      }

      variables = {
        input: {
          teamId: team_id,
          title: title,
          description: description,
          createAsUser: member.user.display_name,
          displayIconUrl: member.user.avatar_url(size: 40),
        },
      }

      response = @client.send(JSON[{
        "query" => query_template,
        "variables" => variables,
      }])

      response.body.dig("data", "issueCreate", "issue")
    end

    def get(id:)
      query_template = %{
        query GetIssue {
          issue(
            id: "%<id>s",
          ) {
            identifier
            title
            description
            url
            state {
              id
              color
              name
              type
            }
          }
        }
      }

      query = format(query_template, id: id)

      @client.send(JSON[{ "query" => query }]).body.dig("data", "issue")
    end
  end
end
