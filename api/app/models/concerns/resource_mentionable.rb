# frozen_string_literal: true

module ResourceMentionable
  extend ActiveSupport::Concern

  included do
    def self.extracted_resource_mentions_async(subjects:, member:)
      return AsyncPreloader.value({}) unless member

      # build a map of subject id to the posts, calls, and notes that are mentioned in the subject
      resource_mention_collection_map = subjects.map do |subject|
        [subject.id, ResourceMentionCollection.new(subject.resource_mentionable_parsed_html)]
      end.to_h

      # unique mentioned ids for each type across all subjects
      uniq_mention_ids_by_type = resource_mention_collection_map.values.each_with_object({}) do |collection, acc|
        acc[:posts] = (acc[:posts] || []).concat(collection.post_ids).uniq
        acc[:calls] = (acc[:calls] || []).concat(collection.call_ids).uniq
        acc[:notes] = (acc[:notes] || []).concat(collection.note_ids).uniq
      end

      # if there are no mentions, bail
      return AsyncPreloader.value({}) if uniq_mention_ids_by_type.empty? || uniq_mention_ids_by_type.values.all?(&:empty?)

      posts_scope = Post.where(public_id: uniq_mention_ids_by_type[:posts])
      calls_scope = Call.where(public_id: uniq_mention_ids_by_type[:calls])
        .preload(room: { subject: { organization_memberships: :user } })
      notes_scope = Note.where(public_id: uniq_mention_ids_by_type[:notes])

      # policy scope everything
      scopes = [posts_scope, calls_scope, notes_scope].map { |scope| Pundit.policy_scope(member.user, scope) }

      AsyncPreloader.new(scopes) do |scopes|
        # unpack the scopes and turn each array of results into a map by public_id
        posts_map, calls_map, notes_map = scopes.map { |scope| scope.index_by(&:public_id) }

        resource_mention_collection_map.map do |subject_id, collection|
          collection.add_fetched_results(posts_map: posts_map, calls_map: calls_map, notes_map: notes_map)

          [
            subject_id,
            collection,
          ]
        end.to_h
      end
    end
  end

  def resource_mentionable_parsed_html
    raise NotImplementedError
  end
end
