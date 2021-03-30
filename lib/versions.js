const semver = require('semver')

const splitSemVer = (input, versionKey = 'version') => {
  if (!input[versionKey]) {
    return null
  }

  const version = input.inc
    ? semver.inc(input[versionKey], input.inc, true)
    : semver.parse(input[versionKey])

  return {
    ...input,
    version,
    $MAJOR: semver.major(version),
    $MINOR: semver.minor(version),
    $PATCH: semver.patch(version),
    $PRERELEASE: semver.prerelease(version),
  }
}

const getTemplatableVersion = (input) => {
  const templatableVersion = {
    $NEXT_MAJOR_VERSION: splitSemVer({ ...input, inc: 'major' }),
    $NEXT_MINOR_VERSION: splitSemVer({ ...input, inc: 'minor' }),
    $NEXT_PATCH_VERSION: splitSemVer({ ...input, inc: 'patch' }),
    $NEXT_PRERELEASE_VERSION: splitSemVer({ ...input, inc: 'prerelease' }),
    $INPUT_VERSION: splitSemVer(input, 'inputVersion'),
    $RESOLVED_VERSION: splitSemVer({
      ...input,
      inc: 'prerelease',
    }),
  }

  templatableVersion.$RESOLVED_VERSION =
    templatableVersion.$INPUT_VERSION || templatableVersion.$RESOLVED_VERSION

  return templatableVersion
}

const coerceVersion = (input) => {
  if (!input) {
    return null
  }

  return semver.clean(input.tag_name)
}

module.exports.getVersionInfo = (
  release,
  template,
  inputVersion = null,
  versionKeyIncrement = null
) => {
  const version = coerceVersion(release)
  inputVersion = coerceVersion(inputVersion)

  if (!version && !inputVersion) {
    return undefined
  }

  return {
    ...getTemplatableVersion({
      version,
      template,
      inputVersion,
      versionKeyIncrement,
    }),
  }
}
