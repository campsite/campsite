# frozen_string_literal: true

module EventProcessors
  class MessageThreadUpdatedEventProcessor < BaseEventProcessor
    def process!
      return if actor.is_a?(OrganizationMembership::NullOrganizationMembership)

      messages_content.each { |content| subject.send_message!(content: content) }
      subject.mark_read(actor)
    end

    private

    def messages_content
      [].tap do |result|
        if subject_previous_changes["title"]
          result.push("#{actor.display_name} changed the title to “#{subject.formatted_title(actor)}.”")
        end

        if subject_previous_changes["image_path"]
          result.push("#{actor.display_name} changed the image.")
        end
      end
    end
  end
end
