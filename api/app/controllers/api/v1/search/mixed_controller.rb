# frozen_string_literal: true

module Api
  module V1
    module Search
      class MixedController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized
        # Skip policy scope since it will raise on empty results

        response model: SearchMixedSerializer, code: 200
        request_params do
          {
            q: { type: :string },
            focus: { type: :string, enum: [:posts, :calls, :notes], required: false },
          }
        end
        def index
          authorize(current_organization, :search?)

          focus = params[:focus]
          query = params[:q]
          per_resource_limit = focus.nil? ? 10 : 30
          total_limit = focus.nil? ? 30 : 100

          posts_result = Post.scoped_search(organization: current_organization, query: query) if focus.nil? || focus == "posts"
          calls_result = Call.scoped_search(organization: current_organization, query: query) if focus.nil? || focus == "calls"
          notes_result = Note.scoped_search(organization: current_organization, query: query) if focus.nil? || focus == "notes"

          Searchkick.multi_search([posts_result, calls_result, notes_result].compact)

          posts_result ||= []
          calls_result ||= []
          notes_result ||= []

          post_ids = posts_result.pluck(:id) || []
          call_ids = calls_result.pluck(:id) || []
          note_ids = notes_result.pluck(:id) || []

          posts_async = post_ids.empty? ? policy_scope(Post.none) : policy_scope(Post.in_order_of(:id, post_ids).eager_load(SearchPostSerializer::POST_INCLUDES)).limit(per_resource_limit).load_async
          calls_async = call_ids.empty? ? policy_scope(Call.none) : policy_scope(Call.in_order_of(:id, call_ids)).limit(per_resource_limit).load_async
          notes_async = note_ids.empty? ? policy_scope(Note.none) : policy_scope(Note.in_order_of(:id, note_ids).eager_load(SearchNoteSerializer::NOTE_INCLUDES)).limit(per_resource_limit).load_async

          posts = posts_async.index_by(&:id)
          notes = notes_async.index_by(&:id)
          calls = calls_async.index_by(&:id)

          # pluck the id+score and add a type so that we can merge them
          post_items = posts_result.map { |h| h.merge(type: :post, resource: posts[h[:id]]) }
          call_items = calls_result.map { |h| h.merge(type: :call, resource: calls[h[:id]]) }
          note_items = notes_result.map { |h| h.merge(type: :note, resource: notes[h[:id]]) }

          # combine all the results
          results = (post_items + call_items + note_items)
            # remove missing resources (e.g. filtered out by policy_scope)
            .select { |h| !h[:resource].nil? }
            # sort by score descending
            .sort_by { |h| -h[:_score] }
            # limit the results
            .first(total_limit)

          payload = {
            items: results,
            posts: results.select { |r| r[:type] == :post }.pluck(:resource),
            calls: results.select { |r| r[:type] == :call }.pluck(:resource),
            notes: results.select { |r| r[:type] == :note }.pluck(:resource),
          }

          render_json(SearchMixedSerializer, payload)
        end
      end
    end
  end
end
