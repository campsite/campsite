# frozen_string_literal: true

class Feedback < ApplicationRecord
  enum :feedback_type, { bug: 0, feature: 1 }

  belongs_to :user
  belongs_to :organization, optional: true

  include ImgixUrlBuilder

  def self.generate_presigned_fields(organization, mime_type)
    extension = Rack::Mime::MIME_TYPES.invert[mime_type]
    PresignedPostFields.generate(key: "o/#{organization.public_id}/fb/#{SecureRandom.uuid}#{extension}", max_file_size: 100.megabytes, mime_type: mime_type)
  end

  def plain_components
    components = [Plain::Components::PlainText.new(plain_text: description), Plain::Components::Spacer.new]

    if screenshot_path.present?
      components += [
        Plain::Components::LinkButton.new(link_button_label: "Screenshot", link_button_url: build_imgix_url(screenshot_path)),
        Plain::Components::Spacer.new,
      ]
    end

    components + [
      Plain::Components::Row.new(
        row_main_content: Plain::Components::Text.new(text: "Organization", text_color: "MUTED"),
        row_aside_content: Plain::Components::Text.new(text: organization.name),
      ),
      Plain::Components::Spacer.new(spacer_size: "XS"),
      Plain::Components::Row.new(
        row_main_content: Plain::Components::Text.new(text: "Page", text_color: "MUTED"),
        row_aside_content: Plain::Components::Text.new(text: current_url),
      ),
      Plain::Components::Spacer.new(spacer_size: "XS"),
      Plain::Components::Row.new(
        row_main_content: Plain::Components::Text.new(text: "Browser", text_color: "MUTED"),
        row_aside_content: Plain::Components::Text.new(text: browser_info),
      ),
      Plain::Components::Spacer.new(spacer_size: "XS"),
      Plain::Components::Row.new(
        row_main_content: Plain::Components::Text.new(text: "OS", text_color: "MUTED"),
        row_aside_content: Plain::Components::Text.new(text: os_info),
      ),
    ]
  end
end
