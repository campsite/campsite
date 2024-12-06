# frozen_string_literal: true

class LinearClient
  class Attachments
    def initialize(client)
      @client = client
    end

    def create(issue_id:, title:, subtitle:, url:)
      query = %{
        mutation AttachmentCreate($issueId: String!, $title: String!, $subtitle: String, $url: String!) {
          attachmentCreate(
            input: {
              issueId: $issueId,
              title: $title,
              subtitle: $subtitle,
              url: $url,
            }
          ) {
            success
            attachment {
              id
            }
          }
        }
      }

      variables = {
        issueId: issue_id,
        title: title,
        subtitle: subtitle&.truncate(2048),
        url: url,
      }

      @client.send(JSON[{ "query" => query, "variables" => variables }]).body.dig("data", "attachmentCreate", "attachment")
    end
  end
end
