// Damage

import { DEAD, SPAWN } from '../Constants';
import { vectorAdd } from '../Util';
import { HealthChunkAnimation } from '../HealthChunkAnimation';
import { game } from '../Game';
import { Gore } from '../Gore';
import { Audio } from '../Audio';

/**
 * Damage
 */
export const Damage = {
    perform(entities) {
        let hit = false;
        for (let entity of entities) {
            if (entity.hp) {
                if (entity.damage.length > 0) {
                    if (entity.state !== DEAD && entity.state !== SPAWN) {
                        for (let damage of entity.damage) {
                            if (entity === game.player) {
                                game.entities.push(
                                    new HealthChunkAnimation(
                                        entity.hp,
                                        damage.amount
                                    )
                                );
                            }
                            entity.hp -= damage.amount;
                            damage.vector.m = damage.knockback;
                            entity.vel = vectorAdd(entity.vel, damage.vector);
                            entity.lastDamage = damage;
                            Gore.damage(entity);
                            hit = true;
                        }
                    }
                    entity.damage = [];
                }
                if (entity.hp <= 0 && entity.state !== DEAD) {
                    entity.state = DEAD;
                }
            }
        }

        if (hit) Audio.play(Audio.damage);
    }
};
