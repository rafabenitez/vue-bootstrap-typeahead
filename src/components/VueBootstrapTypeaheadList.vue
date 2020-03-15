<template>
  <div class="list-group shadow">
    <vue-bootstrap-typeahead-list-item
      v-for="(item, id) in matchedItems" :key="id"
      :data="item.data"
      :html-text="highlight(item)"
      :background-variant="backgroundVariant"
      :text-variant="textVariant"
      @click.native="handleHit(item, $event)"
    >
      <template v-if="$scopedSlots.suggestion" slot="suggestion" slot-scope="{ data, htmlText }">
        <slot name="suggestion" v-bind="{ data, htmlText }" />
      </template>
    </vue-bootstrap-typeahead-list-item>
  </div>
</template>

<script>
    import VueBootstrapTypeaheadListItem from './VueBootstrapTypeaheadListItem.vue'
    import normalize from './normalize'

    function sanitize(text) {
        return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    export default {
        name: 'VueBootstrapTypeaheadList',

        components: {
            VueBootstrapTypeaheadListItem
        },

        props: {
            data: {
                type: Array,
                required: true,
                validator: d => d instanceof Array
            },
            query: {
                type: String,
                default: ''
            },
            backgroundVariant: {
                type: String
            },
            textVariant: {
                type: String
            },
            maxMatches: {
                type: Number,
                default: 10
            },
            minMatchingChars: {
                type: Number,
                default: 2
            }
        },

        computed: {
            highlight() {
                return (item) => {
                    const text = sanitize(item.text);
                    const normalized = sanitize(item.normalizedText);
                    if (this.query.length === 0) {
                        return text
                    }
                    const re = new RegExp(this.escapedQuery, 'gi');

                    const match = re.exec(normalized);

                    if (match) {
                        const end = match.index + match[0].length;
                        return text.substring(0, match.index) + `<strong>${text.substring(match.index, end)}</strong>` + text.substring(end, text.length);
                    } else {
                        return text;
                    }
                }
            },

            escapedQuery() {
                return escapeRegExp(normalize(sanitize(this.query)));
            },

            matchedItems() {
                if (this.query.length === 0 || this.query.length < this.minMatchingChars) {
                    return []
                }

                const re = new RegExp(this.escapedQuery, 'gi');

                // Filter, sort, and concat
                return this.data
                    .filter(i => i.normalizedText.match(re) !== null)
                    .sort((a, b) => {
                        const aIndex = a.normalizedText.indexOf(a.normalizedText.match(re)[0])
                        const bIndex = b.normalizedText.indexOf(b.normalizedText.match(re)[0])

                        if (aIndex < bIndex) { return -1 }
                        if (aIndex > bIndex) { return 1 }
                        return 0
                    }).slice(0, this.maxMatches)
            }
        },

        methods: {
            handleHit(item, evt) {
                this.$emit('hit', item)
                evt.preventDefault()
            }
        }
    }
</script>
