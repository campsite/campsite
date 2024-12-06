# frozen_string_literal: true

module Api
  module V1
    class FeedbacksController < BaseController
      extend Apigen::Controller

      response code: 201 do
        {}
      end
      request_params do
        {
          description: { type: :string },
          feedback_type: { type: :string, enum: [:bug, :feature, :general] },
          screenshot_path: { type: :string, required: false },
          current_url: { type: :string },
        }
      end
      def create
        authorize(current_user, :create_feedback?)

        clean_description = params[:description]&.strip
        if clean_description.blank?
          return render_error(
            status: :unprocessable_entity,
            code: :unprocessable,
            message: "Feedback description is required.",
          )
        end
        unless params.key?(:feedback_type)
          return render_error(
            status: :unprocessable_entity,
            code: :unprocessable,
            message: "Feedback type is required.",
          )
        end
        unless params.key?(:current_url)
          return render_error(
            status: :unprocessable_entity,
            code: :unprocessable,
            message: "The current url is required.",
          )
        end

        feedback = Feedback.create!(
          user: current_user,
          organization: current_organization,
          description: clean_description,
          feedback_type: params[:feedback_type],
          current_url: params[:current_url],
          browser_info: browser_info,
          os_info: os_info,
          screenshot_path: params[:screenshot_path],
        )

        current_user.staff? ? LinearIssueJob.perform_async(feedback.id) : SendFeedbackToPlainJob.perform_async(feedback.id)

        render(json: {}, status: :created)
      end

      response model: PresignedPostFieldsSerializer, code: 200
      request_params do
        {
          mime_type: { type: :string },
        }
      end
      def presigned_fields
        authorize(current_organization, :show_presigned_fields?)

        presigned_fields = Feedback.generate_presigned_fields(current_organization, params[:mime_type])
        render_json(PresignedPostFieldsSerializer, presigned_fields)
      end

      private

      def device_info
        @device_info ||= if request.user_agent.present?
          user_agent_client = DeviceDetector.new(request.user_agent)

          info = {
            browser_name: user_agent_client.name,
            browser_version: user_agent_client.full_version,
            os_name: user_agent_client.os_name,
            os_version: user_agent_client.os_full_version,
            device_name: user_agent_client.device_name,
            device_type: user_agent_client.device_type,
            device_brand: user_agent_client.device_brand,
            is_desktop_app: false,
          }

          if (desktop_app_parts = request.user_agent.match(ProductLogsJob::CAMPSITE_UA_REGEX))
            info[:is_desktop_app] = true
            info[:desktop_app_version] = desktop_app_parts[0].split("/")[1]
          end

          info
        else
          {}
        end
      end

      def browser_info
        browser_info = if device_info[:is_desktop_app]
          "Desktop App #{device_info[:desktop_app_version]}"
        else
          [device_info[:browser_name], device_info[:browser_version]].compact.join(" ")
        end

        if device_info[:device_brand] || device_info[:device_type]
          browser_info += " (#{[device_info[:device_brand], device_info[:device_type]].compact.join(" ")})"
        end

        browser_info
      end

      def os_info
        return "Unknown" if !device_info[:os_name] && !device_info[:os_version]

        [device_info[:os_name], device_info[:os_version]].compact.join(" ")
      end
    end
  end
end
