# frozen_string_literal: true

module Reactable
  extend ActiveSupport::Concern

  included do
    has_many :reactions, as: :subject, dependent: :destroy_async

    def self.grouped_reactions_async(subject_ids, member)
      scope = Reaction.where(subject_id: subject_ids, subject_type: polymorphic_name)
        .kept
        .joins(member: :user)
        .left_outer_joins(:custom_content)
        .group(:subject_id, :content, :custom_reaction_id)
        .order(Arel.sql("MIN(#{reflections["reactions"].table_name}.created_at)"))
        .async_pluck(
          :subject_id,
          :content,
          :custom_reaction_id,
          member ? Arel.sql("MAX(IF(reactions.organization_membership_id=#{member.id}, reactions.public_id, NULL))") : Arel.sql("NULL"),
          Arel.sql("COUNT(*)"),
          Arel.sql("JSON_ARRAYAGG(COALESCE(users.name, users.username, users.email))"),
        )

      AsyncPreloader.new(scope) do |scope|
        custom_reactions = CustomReaction.where(id: scope.map(&:third).compact.uniq).index_by(&:id)

        grouped_reactions = {}
        scope.map do |subject_id, content, custom_reaction_id, viewer_reaction_id, reactions_count, users_json| # rubocop:disable Metrics/ParameterLists
          users_array = JSON.parse(users_json)
          visible_users = users_array[0..9]
          overflow_count = users_array.size - visible_users.size
          overflow_text = overflow_count > 0 ? " and #{overflow_count} #{"other".pluralize(overflow_count)}" : ""
          tooltip_text = [visible_users.join(", "), overflow_text].join

          grouped_reactions[subject_id] ||= []
          grouped_reactions[subject_id] << {
            viewer_reaction_id: viewer_reaction_id,
            emoji: content,
            custom_content: custom_reactions[custom_reaction_id],
            reactions_count: reactions_count,
            tooltip: tooltip_text,
          }
        end
        grouped_reactions
      end
    end
  end
end
