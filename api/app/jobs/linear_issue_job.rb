# frozen_string_literal: true

# Collect Feedback issues that haven't been posted to Linear and post them
class LinearIssueJob < BaseJob
  sidekiq_options queue: "background"

  include ImgixUrlBuilder

  def perform(feedback_id)
    @feedback_id = feedback_id

    description_template = <<~DESC.strip
        %{description}

      - **User:** %{username} (`%{user_id}`, [email](mailto:%{email}))
      - **Org:** %{organization} (`%{organization_id}`)
      - **Plan**: %{plan}
      - **Page:** `%{current_url}`
      - **Browser:** %{browser_info}
      - **OS:** %{os_info}
    DESC

    description = format(
      description_template,
      description: feedback.description,
      username: feedback.user.name,
      user_id: feedback.user.public_id,
      email: feedback.user.email,
      organization: feedback.organization.name,
      organization_id: feedback.organization.public_id,
      current_url: feedback.current_url,
      plan: feedback.organization.plan_name,
      browser_info: feedback.browser_info,
      os_info: feedback.os_info,
    )

    if feedback.screenshot_path
      extension = File.extname(feedback.screenshot_path).downcase
      file_type = Rack::Mime::MIME_TYPES[extension]

      # The Linear API supports embedding images in markdown the description,
      # but not other file types. In the future, we could consider uploading
      # videos to Linear's private cloud storage and adding them to the issue.
      #
      # https://developers.linear.app/docs/guides/how-to-upload-a-file-to-linear
      description += if file_type.starts_with?("image")
        "\n\n![Screenshot](#{build_imgix_url(feedback.screenshot_path)})"
      else
        "\n\n[Attachment](#{build_imgix_url(feedback.screenshot_path)})"
      end
    end

    post_to_linear(description, feedback.feedback_type)
    feedback.update!(posted_to_linear_at: Time.current)
  end

  LINEAR_CAMPSITE_TEAM_ID = "f032f417-c15a-4b9b-b82c-d4e880b1c396"
  LINEAR_USER_REPORTED_LABEL_ID = "44cb58b9-cd83-4a13-b148-5b5751b4563c"
  LINEAR_LABEL_ID_MAP = {
    "bug" => "77d76482-0cb9-4adc-8053-a965e0b36212",
    "feature" => "ad879049-fa82-4d18-b4fb-9e0a7e411d9a",
  }

  private

  def feedback
    @feedback ||= Feedback.find(@feedback_id)
  end

  def linear_client
    @linear_client ||= LinearClient.new(Rails.application.credentials&.dig(:linear, :token))
  end

  def post_to_linear(contents, label)
    query_template = %{mutation IssueCreate {
      issueCreate(
        input: {
          teamId: "%<team_id>s",
          title: "%<title>s",
          labelIds: ["%<feedback_label_id>s", "%<category_label_id>s"],
          description: """%<description>s""",
        }
      ) {
        success
        issue {
          url
          number
        }
      }
    }
    }

    clean_contents = contents.strip.gsub('"', '\"')

    query = format(
      query_template,
      team_id: LINEAR_CAMPSITE_TEAM_ID,
      # trim content to first line and 128 characters
      title: clean_contents.split("\n")[0][0...128] || "Unknown",
      feedback_label_id: LINEAR_USER_REPORTED_LABEL_ID,
      category_label_id: LINEAR_LABEL_ID_MAP[label],
      description: clean_contents,
    )

    linear_client.send(JSON[{ "query" => query }]).body
  end
end
