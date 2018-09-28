library(
    identifier: 'pipeline-lib@4.3.0',
    retriever: modernSCM([$class: 'GitSCMSource',
                          remote: 'https://github.com/SmartColumbusOS/pipeline-lib',
                          credentialsId: 'jenkins-github-user'])
)

properties([
    pipelineTriggers([scos.dailyBuildTrigger()]),
])

def image
def doStageIf = scos.&doStageIf
def doStageIfRelease = doStageIf.curry(scos.changeset.isRelease)
def doStageUnlessRelease = doStageIf.curry(!scos.changeset.isRelease)
def doStageIfPromoted = doStageIf.curry(scos.changeset.isMaster)

node('infrastructure') {
    ansiColor('xterm') {
        scos.doCheckoutStage()

        doStageUnlessRelease('Build') {
            image = docker.build("scos/cota-streaming-ui:${env.GIT_COMMIT_HASH}")
        }

        doStageUnlessRelease('Deploy to Dev') {
            scos.withDockerRegistry {
                image.push()
                image.push('latest')
            }
            deployUiTo(environment: 'dev')
            runSmokeTestAgainst('dev')
        }


        doStageIfPromoted('Deploy to Staging') {
            def promotionTag = scos.releaseCandidateNumber()

            deployUiTo(environment: 'staging')
            runSmokeTestAgainst('staging')

            scos.applyAndPushGitHubTag(promotionTag)

            scos.withDockerRegistry {
                image.push(promotionTag)
            }
        }

        doStageIfRelease('Deploy to Production') {
            def releaseTag = env.BRANCH_NAME
            def promotionTag = 'prod'

            /* change internal to false when we're ready to release */
            deployUiTo(environment: 'prod', internal: true)
            runSmokeTestAgainst('prod')

            scos.applyAndPushGitHubTag(promotionTag)

            scos.withDockerRegistry {
                image = scos.pullImageFromDockerRegistry("scos/cota-streaming-ui", env.GIT_COMMIT_HASH)
                image.push(releaseTag)
                image.push(promotionTag)
            }
        }
    }
}

def deployUiTo(params = [:]) {
    def environment = params.get('environment')
    if (environment == null) throw new IllegalArgumentException("environment must be specified")

    def internal = params.get('internal', true)

    scos.withEksCredentials(environment) {
        def terraformOutputs = scos.terraformOutput(environment)
        def subnets = terraformOutputs.public_subnets.value.join(', ')
        def allowInboundTrafficSG = terraformOutputs.allow_all_security_group.value
        def certificateARN = terraformOutputs.tls_certificate_arn.value

        def ingressScheme = internal ? 'internal' : 'internet-facing'
        sh("""#!/bin/bash
            set -e
            export VERSION="${env.GIT_COMMIT_HASH}"
            export DNS_ZONE="${environment}.internal.smartcolumbusos.com"
            export SUBNETS="${subnets}"
            export SECURITY_GROUPS="${allowInboundTrafficSG}"
            export INGRESS_SCHEME=${ingressScheme}
            export CERTIFICATE_ARN="${certificateARN}"

            kubectl apply -f k8s/configs/${environment}.yaml
            for manifest in k8s/deployment/*; do
                cat \$manifest | envsubst | kubectl apply -f -
            done
        """.trim())
    }
}

def runSmokeTestAgainst(environment) {
    dir('smoke-test') {
        def smoker = docker.build("cota-smoke-test")

        retry(60) {
            sleep(time: 5, unit: 'SECONDS')
            smoker.withRun("-e ENDPOINT_URL=cota.${environment}.internal.smartcolumbusos.com") { container ->
                sh "docker logs -f ${container.id}"
                sh "exit \$(docker inspect ${container.id} --format='{{.State.ExitCode}}')"
            }
        }
    }
}
