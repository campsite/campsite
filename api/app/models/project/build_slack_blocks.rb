# frozen_string_literal: true

class Project
  class BuildSlackBlocks
    MAX_CONTRIBUTORS = 3

    def initialize(project:)
      @project = project
    end

    attr_reader :project

    delegate :name, :accessory, :url, :description, :contributors, to: :project
    delegate :mrkdwn_section_block, :mrkdwn_context_block, :mrkdwn_link, to: SlackBlockKit

    def run
      [
        title_block,
        description_block,
        contributors_block,
      ].compact
    end

    private

    def title_block
      mrkdwn_section_block(text: "*#{mrkdwn_link(url: url, text: [accessory, name].compact_blank.join(" "))}*")
    end

    def description_block
      return if description.blank?

      mrkdwn_section_block(text: description)
    end

    def contributors_block
      return if contributors.count == 0

      contributors_text = if contributors.count > MAX_CONTRIBUTORS + 1
        contributors.take(MAX_CONTRIBUTORS).map(&:display_name).join(", ") + ", and #{contributors.count - MAX_CONTRIBUTORS} others"
      else
        contributors.take(MAX_CONTRIBUTORS + 1).map(&:display_name).to_sentence
      end

      mrkdwn_context_block(text: "Contributors: #{contributors_text}")
    end
  end
end
