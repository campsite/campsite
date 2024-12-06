# frozen_string_literal: true

class ReactionsFormatter
  def initialize(text, organization:)
    @text = text
    @organization = organization
  end

  def replace
    re = /:([\w-]+):/
    reaction_ids = @text.scan(re).flatten.uniq
    reactions = CustomReaction.where(name: reaction_ids, organization: @organization)
    reactions.each do |reaction|
      @text = @text.gsub(":#{reaction.name}:", reaction.to_html)
    end

    @text
  end
end
