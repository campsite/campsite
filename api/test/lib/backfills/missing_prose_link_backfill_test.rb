# frozen_string_literal: true

require "test_helper"

module Backfills
  class MissingProseLinkBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      it "dry run is a no-op" do
        hit_1 = create(:post, description_html: 'This is a post with a link to <a href="https://www.example.com">example.com</a>')
        hit_2 = create(:post, description_html: 'This is a post with a link to <a class="foo" href="https://www.example.com">example.com</a>')
        miss = create(:post, description_html: 'This is a post with a link to <a class="prose-link" href="https://www.example.com">example.com</a>')

        MissingProseLinkBackfill.run

        assert_equal 'This is a post with a link to <a href="https://www.example.com">example.com</a>', hit_1.reload.description_html
        assert_equal 'This is a post with a link to <a class="foo" href="https://www.example.com">example.com</a>', hit_2.reload.description_html
        assert_equal 'This is a post with a link to <a class="prose-link" href="https://www.example.com">example.com</a>', miss.reload.description_html
      end

      it "updates link elements" do
        hit_1 = create(:post, description_html: 'This is a post with a link to <a href="https://www.example.com">example.com</a>')
        hit_2 = create(:post, description_html: 'This is a post with a link to <a class="foo" href="https://www.example.com">example.com</a>')
        miss = create(:post, description_html: 'This is a post with a link to <a class="prose-link" href="https://www.example.com">example.com</a>')

        MissingProseLinkBackfill.run(dry_run: false)

        [hit_1, hit_2, miss].each(&:reload)

        assert_equal 'This is a post with a link to <a href="https://www.example.com" class="prose-link">example.com</a>', hit_1.description_html
        assert_equal 'This is a post with a link to <a class="foo prose-link" href="https://www.example.com">example.com</a>', hit_2.description_html
        assert_equal 'This is a post with a link to <a class="prose-link" href="https://www.example.com">example.com</a>', miss.description_html
      end
    end
  end
end
